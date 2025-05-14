module usdc::usdc {

    use std::signer;
    use aptos_std::coin;
    use aptos_std::managed_coin;

    struct USDC has store, copy, drop {}

    public fun initialize(admin: &signer) {
        managed_coin::initialize<USDC>(
            admin,
            b"USDC",
            b"USDC",
            6,           // 6 decimals, like real USDC
            false
        );
    }

    public fun mint(admin: &signer, recipient: address, amount: u64) {
        managed_coin::mint<USDC>(admin, recipient, amount);
    }

    public fun burn(owner: &signer, amount: u64) {
        managed_coin::burn<USDC>(owner, amount);
    }

    public fun register(account: &signer) {
        coin::register<USDC>(account);
    }

    public fun transfer(sender: &signer, recipient: address, amount: u64) {
        coin::transfer<USDC>(sender, recipient, amount);
    }
}
