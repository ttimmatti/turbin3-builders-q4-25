use anchor_lang::prelude::*;
use mpl_core::{
    instructions::UpdatePluginV1CpiBuilder,
    types::{FreezeDelegate, Plugin},
    ID as CORE_PROGRAM_ID,
};

use crate::{error::MPLXCoreError, program::AnchorMplxcoreQ425, state::CollectionAuthority};

#[derive(Accounts)]
pub struct ThawNft<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub collection: Signer<'info>,
    #[account(
        seeds = [b"collection_authority", collection.key().as_ref()],
        bump
    )]
    pub collection_authority: Account<'info, CollectionAuthority>,
    #[account(address = CORE_PROGRAM_ID)]
    /// CHECK: This will also be checked by core
    pub core_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    #[account(constraint = this_program.programdata_address()? == Some(program_data.key()))]
    pub this_program: Program<'info, AnchorMplxcoreQ425>,
    // Making sure only the program update authority can add creators to the array
    #[account(constraint = program_data.upgrade_authority_address == Some(payer.key()) @ MPLXCoreError::NotAuthorized)]
    pub program_data: Account<'info, ProgramData>,
}

impl<'info> ThawNft<'info> {
    pub fn thaw_nft(&mut self) -> Result<()> {
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"collection_authority",
            &self.collection.key().to_bytes(),
            &[self.collection_authority.bump],
        ]];

        UpdatePluginV1CpiBuilder::new(&self.core_program.to_account_info())
            .collection(Some(&self.collection.to_account_info()))
            .plugin(Plugin::FreezeDelegate(FreezeDelegate { frozen: false }))
            .authority(Some(&self.collection_authority.to_account_info()))
            .system_program(&self.system_program.to_account_info())
            .invoke_signed(signer_seeds)?;

        Ok(())
    }
}
