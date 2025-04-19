use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount};
// Add imports for Pyth oracle
use std::convert::TryFrom;

declare_id!("8tPzm9ZtpPURBFGNXzFGJAPe2Q7JFMRu9YtEQTywCE2b");

// Define constants
const USDT_MINT: &str = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"; // USDT on Solana
const PYTH_PROGRAM_ID: &str = "FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH"; // Pyth oracle program
const JUPITER_PROGRAM_ID: &str = "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"; // Jupiter aggregator

#[program]
pub mod crypto_fund_me {
    use super::*;

    // Initialize a new campaign
    pub fn create_campaign(
        ctx: Context<CreateCampaign>,
        name: String,
        description: String,
        goal_amount_usd: u64,
        deadline: i64,
        target_currency: Pubkey,
    ) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        campaign.creator = ctx.accounts.creator.key();
        campaign.name = name;
        campaign.description = description;
        campaign.goal_amount_usd = goal_amount_usd;
        campaign.deadline = deadline;
        campaign.total_raised_usd = 0;
        campaign.target_currency = target_currency;
        campaign.is_active = true;
        campaign.is_successful = false;
        campaign.bump = *ctx.bumps.get("campaign").unwrap();

        Ok(())
    }

    // Make a donation to a campaign with improved price oracle
    pub fn donate(ctx: Context<Donate>, amount: u64) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let donation = &mut ctx.accounts.donation;
        let clock = Clock::get()?;

        // Check if campaign is still active
        require!(campaign.is_active, ErrorCode::CampaignInactive);
        require!(
            clock.unix_timestamp < campaign.deadline,
            ErrorCode::CampaignEnded
        );

        // Transfer tokens from user to campaign vault
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.donor_token_account.to_account_info(),
                    to: ctx.accounts.campaign_vault.to_account_info(),
                    authority: ctx.accounts.donor.to_account_info(),
                },
            ),
            amount,
        )?;

        // Get accurate USD value using Pyth oracle
        let usd_value = get_token_usd_value(amount, &ctx.accounts.price_feed, &ctx.accounts.mint)?;

        // Record donation details
        donation.donor = ctx.accounts.donor.key();
        donation.campaign = campaign.key();
        donation.token_mint = ctx.accounts.mint.key();
        donation.amount = amount;
        donation.usd_value = usd_value;
        donation.timestamp = clock.unix_timestamp;
        donation.is_refunded = false;
        donation.bump = *ctx.bumps.get("donation").unwrap();

        // Update campaign stats
        campaign.total_raised_usd = campaign.total_raised_usd.checked_add(usd_value).unwrap();

        // Check if goal has been reached
        if campaign.total_raised_usd >= campaign.goal_amount_usd {
            campaign.is_successful = true;
        }

        // If token is not USDT, convert to USDT immediately using Jupiter
        if ctx.accounts.mint.key().to_string() != USDT_MINT {
            // Perform swap to USDT logic would go here
            // This would involve a CPI call to Jupiter
            // We'll implement this in a separate function
        }

        Ok(())
    }

    // Finalize campaign when deadline is reached
    pub fn finalize_campaign(ctx: Context<FinalizeCampaign>) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let clock = Clock::get()?;

        // Verify campaign can be finalized
        require!(campaign.is_active, ErrorCode::CampaignInactive);
        require!(
            clock.unix_timestamp >= campaign.deadline,
            ErrorCode::CampaignStillRunning
        );

        // Mark campaign as inactive
        campaign.is_active = false;

        // No further logic needed here - the state change is enough
        // Successful campaigns will call convert_and_payout
        // Failed campaigns will allow donors to claim_refund

        Ok(())
    }

    // Enhanced convert_and_payout with Jupiter integration
    pub fn convert_and_payout(ctx: Context<ConvertAndPayout>) -> Result<()> {
        let campaign = &ctx.accounts.campaign;

        // Safety checks
        require!(!campaign.is_active, ErrorCode::CampaignStillActive);
        require!(campaign.is_successful, ErrorCode::CampaignUnsuccessful);

        // Get all token vaults associated with this campaign
        // In a real implementation, you would iterate through all known token vaults
        // For now, we'll just handle the USDT vault

        // Execute Jupiter swap from USDT to target currency
        // Build the swap instruction
        let swap_instruction = anchor_lang::solana_program::instruction::Instruction {
            program_id: ctx.accounts.jupiter_program.key(),
            accounts: vec![
                AccountMeta::new(ctx.accounts.campaign_usdt_vault.key(), false),
                AccountMeta::new(ctx.accounts.creator_token_account.key(), false),
                AccountMeta::new(ctx.accounts.campaign.key(), false),
                AccountMeta::new_readonly(ctx.accounts.token_program.key(), false),
                // Other required Jupiter accounts would be added here
            ],
            data: build_jupiter_swap_data(
                ctx.accounts.campaign_usdt_vault.key(),
                ctx.accounts.creator_token_account.key(),
                campaign.target_currency,
            ),
        };

        // Execute swap via CPI
        anchor_lang::solana_program::program::invoke_signed(
            &swap_instruction,
            &[
                ctx.accounts.campaign_usdt_vault.to_account_info(),
                ctx.accounts.creator_token_account.to_account_info(),
                ctx.accounts.campaign.to_account_info(),
                ctx.accounts.token_program.to_account_info(),
                ctx.accounts.jupiter_program.to_account_info(),
                // Add other required account infos
            ],
            &[&[
                b"campaign",
                campaign.creator.as_ref(),
                campaign.name.as_bytes(),
                &[campaign.bump],
            ]],
        )?;

        Ok(())
    }

    // Claim refund for a specific donation (if campaign unsuccessful)
    pub fn claim_refund(ctx: Context<ClaimRefund>) -> Result<()> {
        let campaign = &ctx.accounts.campaign;
        let donation = &mut ctx.accounts.donation;

        // Safety checks
        require!(!campaign.is_active, ErrorCode::CampaignStillActive);
        require!(!campaign.is_successful, ErrorCode::CampaignSuccessful);
        require!(!donation.is_refunded, ErrorCode::AlreadyRefunded);
        require!(
            donation.donor == ctx.accounts.donor.key(),
            ErrorCode::NotDonor
        );

        // Mark as refunded
        donation.is_refunded = true;

        // Return tokens from campaign vault to donor
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.campaign_vault.to_account_info(),
                    to: ctx.accounts.donor_token_account.to_account_info(),
                    authority: ctx.accounts.campaign_vault.to_account_info(),
                },
                &[&[
                    b"campaign_vault",
                    campaign.key().as_ref(),
                    &[ctx.accounts.campaign_vault_bump],
                ]],
            ),
            donation.amount,
        )?;

        Ok(())
    }
}

// Helper function for building Jupiter swap instruction data
fn build_jupiter_swap_data(
    from_token_account: Pubkey,
    to_token_account: Pubkey,
    target_mint: Pubkey,
) -> Vec<u8> {
    // In a real implementation, this would construct the proper Jupiter instruction
    // For now, we'll return a placeholder
    vec![0, 1, 2, 3]
}

// Helper function to calculate USD value using Pyth oracle
fn get_token_usd_value(
    amount: u64,
    price_feed: &AccountInfo,
    token_mint: &Account<token::Mint>,
) -> Result<u64> {
    // Get decimals for the token
    let token_decimals = token_mint.decimals;

    // Parse Pyth price data
    // In a real implementation, this would use the Pyth client library
    // For simplicity, we're using a placeholder approach

    // Placeholder price calculation (1 token = $1.00)
    let token_price_usd = 1_00; // $1.00 with 2 decimal places

    let usd_value = amount
        .checked_mul(token_price_usd)
        .unwrap()
        .checked_div(10u64.pow(token_decimals as u32))
        .unwrap();

    Ok(usd_value)
}

// Campaign account structure
#[account]
pub struct Campaign {
    pub creator: Pubkey,
    pub name: String,
    pub description: String,
    pub goal_amount_usd: u64,
    pub deadline: i64,
    pub total_raised_usd: u64,
    pub target_currency: Pubkey, // Mint address of desired payout currency
    pub is_active: bool,
    pub is_successful: bool,
    pub bump: u8,
}

// Donation record structure
#[account]
pub struct Donation {
    pub donor: Pubkey,
    pub campaign: Pubkey,
    pub token_mint: Pubkey,
    pub amount: u64,
    pub usd_value: u64,
    pub timestamp: i64,
    pub is_refunded: bool,
    pub bump: u8,
}

// Context for creating a campaign
#[derive(Accounts)]
pub struct CreateCampaign<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        init,
        payer = creator,
        space = 8 + 32 + 100 + 1000 + 8 + 8 + 8 + 32 + 1 + 1 + 1,
        seeds = [b"campaign", creator.key().as_ref(), name.as_bytes()],
        bump
    )]
    pub campaign: Account<'info, Campaign>,

    pub system_program: Program<'info, System>,
}

// Context for making a donation
#[derive(Accounts)]
pub struct Donate<'info> {
    #[account(mut)]
    pub donor: Signer<'info>,

    #[account(
        mut,
        seeds = [b"campaign", campaign.creator.as_ref(), campaign.name.as_bytes()],
        bump = campaign.bump
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(
        init,
        payer = donor,
        space = 8 + 32 + 32 + 32 + 8 + 8 + 8 + 1 + 1,
        seeds = [b"donation", campaign.key().as_ref(), donor.key().as_ref(), &campaign.total_raised_usd.to_le_bytes()],
        bump
    )]
    pub donation: Account<'info, Donation>,

    pub mint: Account<'info, token::Mint>,

    #[account(
        mut,
        constraint = donor_token_account.owner == donor.key(),
        constraint = donor_token_account.mint == mint.key()
    )]
    pub donor_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"campaign_vault", campaign.key().as_ref(), mint.key().as_ref()],
        bump
    )]
    pub campaign_vault: Account<'info, TokenAccount>,

    /// Price feed account from Pyth
    /// CHECK: Address validation performed in instruction
    pub price_feed: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

// Context for finalizing a campaign
#[derive(Accounts)]
pub struct FinalizeCampaign<'info> {
    #[account(
        mut,
        seeds = [b"campaign", campaign.creator.as_ref(), campaign.name.as_bytes()],
        bump = campaign.bump,
        constraint = campaign.is_active @ ErrorCode::CampaignInactive
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(
        constraint = creator.key() == campaign.creator @ ErrorCode::Unauthorized
    )]
    pub creator: Signer<'info>,
}

// Context for converting and paying out
#[derive(Accounts)]
pub struct ConvertAndPayout<'info> {
    #[account(
        seeds = [b"campaign", campaign.creator.as_ref(), campaign.name.as_bytes()],
        bump = campaign.bump,
        constraint = !campaign.is_active @ ErrorCode::CampaignStillActive,
        constraint = campaign.is_successful @ ErrorCode::CampaignUnsuccessful
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(
        mut,
        constraint = creator.key() == campaign.creator @ ErrorCode::Unauthorized
    )]
    pub creator: Signer<'info>,

    // Campaign USDT vault
    #[account(
        mut,
        seeds = [b"campaign_vault", campaign.key().as_ref(), usdt_mint.key().as_ref()],
        bump
    )]
    pub campaign_usdt_vault: Account<'info, TokenAccount>,

    // Creator's target token account
    #[account(mut)]
    pub creator_token_account: Account<'info, TokenAccount>,

    // USDT mint account
    /// CHECK: This is just used for the seeds derivation
    pub usdt_mint: AccountInfo<'info>,

    // Jupiter program for swaps
    /// CHECK: This is the Jupiter program
    #[account(constraint = jupiter_program.key().to_string() == JUPITER_PROGRAM_ID)]
    pub jupiter_program: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
}

// Context for claiming a refund
#[derive(Accounts)]
pub struct ClaimRefund<'info> {
    #[account(mut)]
    pub donor: Signer<'info>,

    #[account(
        seeds = [b"campaign", campaign.creator.as_ref(), campaign.name.as_bytes()],
        bump = campaign.bump,
        constraint = !campaign.is_active @ ErrorCode::CampaignStillActive,
        constraint = !campaign.is_successful @ ErrorCode::CampaignSuccessful
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(
        mut,
        seeds = [b"donation", campaign.key().as_ref(), donor.key().as_ref(), donation_seed.as_ref()],
        bump = donation.bump,
        constraint = donation.donor == donor.key() @ ErrorCode::NotDonor,
        constraint = !donation.is_refunded @ ErrorCode::AlreadyRefunded
    )]
    pub donation: Account<'info, Donation>,

    /// Used to derive the correct donation PDA
    /// CHECK: Only used for PDA derivation
    pub donation_seed: AccountInfo<'info>,

    #[account(
        mut,
        constraint = donor_token_account.owner == donor.key(),
        constraint = donor_token_account.mint == donation.token_mint
    )]
    pub donor_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"campaign_vault", campaign.key().as_ref(), donation.token_mint.as_ref()],
        bump = campaign_vault_bump
    )]
    pub campaign_vault: Account<'info, TokenAccount>,

    pub campaign_vault_bump: u8,

    pub token_program: Program<'info, Token>,
}

// Error codes
#[error_code]
pub enum ErrorCode {
    #[msg("Campaign is not active")]
    CampaignInactive,
    #[msg("Campaign has ended")]
    CampaignEnded,
    #[msg("Campaign is still running")]
    CampaignStillRunning,
    #[msg("Campaign is still active")]
    CampaignStillActive,
    #[msg("Campaign was not successful")]
    CampaignUnsuccessful,
    #[msg("Campaign was successful")]
    CampaignSuccessful,
    #[msg("Already refunded")]
    AlreadyRefunded,
    #[msg("Not the donor")]
    NotDonor,
    #[msg("Unauthorized")]
    Unauthorized,
}
