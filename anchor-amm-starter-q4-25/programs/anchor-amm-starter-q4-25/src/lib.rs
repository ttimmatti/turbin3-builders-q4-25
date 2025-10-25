use anchor_lang::prelude::*;

declare_id!("CR6WzBT3A9QA3siLvvT82C6EzqbpnYYCHzMCJkKjw4RS");

#[program]
pub mod anchor_amm_starter_q4_25 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
