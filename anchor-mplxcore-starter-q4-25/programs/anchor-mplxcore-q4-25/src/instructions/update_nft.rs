use anchor_lang::prelude::*;
use mpl_core::{
    accounts::BaseAssetV1, instructions::{UpdateV1CpiBuilder}, ID as CORE_PROGRAM_ID
};

use crate::{error::MPLXCoreError, state::CollectionAuthority};

#[derive(Accounts)]
pub struct UpdateNft<'info> {
    #[account(mut, constraint = authority.key() == collection_authority.creator @ MPLXCoreError::NotAuthorized)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        constraint = collection.owner == &CORE_PROGRAM_ID @ MPLXCoreError::InvalidCollection,
        constraint = collection.key() == collection_authority.collection @ MPLXCoreError::InvalidCollection,
    )]
    /// CHECK: This will also be checked by core
    pub collection: UncheckedAccount<'info>,
    #[account(mut)]
    pub asset: Account<'info, BaseAssetV1>,
    #[account(
        seeds = [b"collection_authority", collection.key().as_ref()],
        bump
    )]
    pub collection_authority: Account<'info, CollectionAuthority>,
    #[account(address = CORE_PROGRAM_ID)]
    /// CHECK: This will also be checked by core
    pub core_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

impl<'info> UpdateNft<'info> {
    pub fn update_nft(&mut self, new_name: Option<String>, new_uri: Option<String>) -> Result<()> {
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"collection_authority",
            &self.collection.key().to_bytes(),
            &[self.collection_authority.bump],
        ]];

        UpdateV1CpiBuilder::new(&self.core_program.to_account_info())
            .asset(&self.asset.to_account_info())
            .collection(Some(&self.collection.to_account_info()))
            .payer(&self.authority.to_account_info())
            .authority(Some(&self.collection_authority.to_account_info()))
            .system_program(&self.system_program.to_account_info())
            .new_name(new_name.unwrap_or(self.asset.name.clone()))
            .new_uri(new_uri.unwrap_or(self.asset.uri.clone()))
            .invoke_signed(signer_seeds)?;

        Ok(())
    }
}
