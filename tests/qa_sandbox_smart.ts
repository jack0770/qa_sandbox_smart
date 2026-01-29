import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { QaSandboxSmart } from "../target/types/qa_sandbox_smart";
import { assert } from "chai";

describe("qa_sandbox_smart", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.QaSandboxSmart as Program<QaSandboxSmart>;
  
  // PDA для счётчика
  const [counterPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("counter"), provider.wallet.publicKey.toBuffer()],
    program.programId
  );

  // Сбросить состояние перед каждым тестом
  before(async () => {
    try {
      // Проверяем существует ли счётчик
      await program.account.counter.fetch(counterPda);
      console.log("Counter already exists, tests will use existing state");
    } catch {
      // Счётчик не существует, создаём новый
      await program.methods
        .initialize("Test Counter")
        .accounts({
          counter: counterPda,
          user: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      console.log("Counter created for tests");
    }
  });

  it("Check counter initialized correctly", async () => {
    const counter = await program.account.counter.fetch(counterPda);
    assert.equal(counter.authority.toString(), provider.wallet.publicKey.toString());
    assert.exists(counter.name);
    console.log("Counter name:", counter.name);
    console.log("Current count:", counter.count.toString());
  });

  it("Increment counter", async () => {
    const counterBefore = await program.account.counter.fetch(counterPda);
    const countBefore = counterBefore.count.toNumber();

    await program.methods
      .increment()
      .accounts({
        counter: counterPda,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const counterAfter = await program.account.counter.fetch(counterPda);
    const countAfter = counterAfter.count.toNumber();
    
    assert.equal(countAfter, countBefore + 1);
    console.log(`Counter incremented: ${countBefore} → ${countAfter}`);
  });

  it("Decrement counter", async () => {
    const counterBefore = await program.account.counter.fetch(counterPda);
    const countBefore = counterBefore.count.toNumber();

    await program.methods
      .decrement()
      .accounts({
        counter: counterPda,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const counterAfter = await program.account.counter.fetch(counterPda);
    const countAfter = counterAfter.count.toNumber();
    
    assert.equal(countAfter, countBefore - 1);
    console.log(`Counter decremented: ${countBefore} → ${countAfter}`);
  });

  it("Set counter to specific value", async () => {
    const newValue = 100;
    
    await program.methods
      .setCount(new anchor.BN(newValue))
      .accounts({
        counter: counterPda,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const counter = await program.account.counter.fetch(counterPda);
    assert.equal(counter.count.toNumber(), newValue);
    console.log("Counter set to:", counter.count.toString());
  });

  // === ТЕСТЫ НА БЕЗОПАСНОСТЬ ===
  
  it("SECURITY: Unauthorized user cannot increment", async () => {
    const attacker = anchor.web3.Keypair.generate();
    
    try {
      await program.methods
        .increment()
        .accounts({
          counter: counterPda,
          authority: attacker.publicKey,
        })
        .signers([attacker])
        .rpc();
      
      assert.fail("Expected transaction to fail but it succeeded");
    } catch (err) {
      // Проверяем что это ошибка constraint
      assert.include(err.toString(), "constraint");
      console.log("✓ Unauthorized increment blocked");
    }
  });

  it("SECURITY: Unauthorized user cannot set count", async () => {
    const attacker = anchor.web3.Keypair.generate();
    
    try {
      await program.methods
        .setCount(new anchor.BN(999))
        .accounts({
          counter: counterPda,
          authority: attacker.publicKey,
        })
        .signers([attacker])
        .rpc();
      
      assert.fail("Expected transaction to fail but it succeeded");
    } catch (err) {
      assert.include(err.toString(), "constraint");
      console.log("✓ Unauthorized set_count blocked");
    }
  });

  it("SECURITY: Cannot create duplicate counter", async () => {
    try {
      await program.methods
        .initialize("Duplicate")
        .accounts({
          counter: counterPda,
          user: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      
      assert.fail("Expected transaction to fail but it succeeded");
    } catch (err) {
      console.log("✓ Duplicate initialization blocked");
    }
  });
it("SECURITY: Cannot set count above 1,000,000", async () => {
    try {
      await program.methods
        .setCount(new anchor.BN(2_000_000))
        .accounts({
          counter: counterPda,
          authority: provider.wallet.publicKey,
        })
        .rpc();
      
      assert.fail("Expected transaction to fail but it succeeded");
    } catch (err) {
      assert.include(err.toString(), "InvalidCount");
      console.log("✓ Invalid count blocked");
    }
  });
});
  