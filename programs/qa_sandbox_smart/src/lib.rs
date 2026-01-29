use anchor_lang::prelude::*;

declare_id!("55g3c8awrw7K8zSCPeBrM7XWkVUXjX6ckFUG28h7wrPb");

#[program]
pub mod qa_sandbox_smart {
    use super::*;

    // Инициализация счётчика
    pub fn initialize(ctx: Context<Initialize>, name: String) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.authority = ctx.accounts.user.key();
        counter.count = 0;
        counter.name = name;
        msg!("Counter initialized with name: {}", counter.name);
        Ok(())
    }

    // Увеличить счётчик
    pub fn increment(ctx: Context<Update>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = counter.count
            .checked_add(1)
            .ok_or(ErrorCode::Overflow)?;
        msg!("Counter incremented to: {}", counter.count);
        Ok(())
    }

    // Уменьшить счётчик
    pub fn decrement(ctx: Context<Update>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = counter.count
            .checked_sub(1)
            .ok_or(ErrorCode::Underflow)?;
        msg!("Counter decremented to: {}", counter.count);
        Ok(())
    }

    // Установить конкретное значение
    pub fn set_count(ctx: Context<Update>, new_count: i64) -> Result<()> {
        require!(new_count >= 0 && new_count <= 1_000_000, ErrorCode::InvalidCount);
        
        let counter = &mut ctx.accounts.counter;
        counter.count = new_count;
        msg!("Counter set to: {}", counter.count);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 8 + 4 + name.len(),
        seeds = [b"counter", user.key().as_ref()],
        bump
    )]
    pub counter: Account<'info, Counter>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(
        mut,
        seeds = [b"counter", authority.key().as_ref()],
        bump,
        has_one = authority
    )]
    pub counter: Account<'info, Counter>,
    pub authority: Signer<'info>,
}

#[account]
pub struct Counter {
    pub authority: Pubkey,  // Владелец счётчика
    pub count: i64,         // Значение счётчика
    pub name: String,       // Название счётчика
}

#[error_code]
pub enum ErrorCode {
    #[msg("Count must be between 0 and 1,000,000")]
    InvalidCount,
    #[msg("Counter overflow")]
    Overflow,
    #[msg("Counter underflow")]
    Underflow,
}
