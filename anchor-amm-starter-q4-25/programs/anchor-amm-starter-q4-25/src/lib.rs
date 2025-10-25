use anchor_lang::prelude::*;

pub mod state;
pub mod error;
pub mod instructions;

pub use instructions::*;

declare_id!("CR6WzBT3A9QA3siLvvT82C6EzqbpnYYCHzMCJkKjw4RS");

#[program]
pub mod anchor_amm_starter_q4_25 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, seed: u64, fee: u16, authority: Option<Pubkey>) -> Result<()> {
        ctx.accounts.init(seed, fee, authority, ctx.bumps)
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64, max_x: u64, max_y: u64) -> Result<()> {
        ctx.accounts.deposit(amount, max_x, max_y)
    }
}
