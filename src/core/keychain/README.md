## Keychain API
The keychain API is a simple API for storing and retrieving secrets, supporting different types of wallets under a common interface.

#### Keychain Manager

The keychain manager is the main entry point for the keychain API. It is responsible for managing the different types of wallets and providing a common interface for the rest of the application to use. 
The keychain manager is a singleton, and can be accessed via the `KeychainManager` class.

The keychain manager is responsible for:  
- Creating and managing the different types of wallets
- Handling the encryption and decryption of keychains called it `vault`

###### Methods
- `addNewKeychain`- Creates a new keychain and adds it to the keychain manager 
- `importKeychain` - Imports a keychain based on its secrets
- `exportKeychain` - Export an entire keychain by returning its secret
- `exportAccount` - Exports the private key for a selected account
- `removeAccount` - Removes the selected account from its own keychain
- `setPassword` - Sets the password to encrypt the vault
- `lock`  - Encrypts all the serialized keychains from memory using the password (we call this the "vault"), persists on the fs and removes it from memory.
- `unlock` - Decrypts the "vault" and loads all the keychains 
- `getSigner` - Returns an [ethers signer](https://docs.ethers.io/v5/api/signer/) for that specific address
- `getKeychain` - Returns the Keychain of a specific address
- `getAccounts` - Returns all the accounts in all the keychains



#### Keychain Types

The keychain manager currently supports the following types of wallets:
- `HdKeychain` (seed based)
- `KeyPairKeychain` (private key based)
- `ReadOnlyKeychain` (public key based)
- `HardwareWalletKeychain` (ledger or trezor based)

All the keychain types implement the `IKeychain` interface, which provides a common interface for the keychain manager to use.


#### IKeychain

The `IKeychain` interface consists of the following methods:

  - `serialize()` - Returns a serialized version of the keychain
  - `deserialize(options: unknown)` - Deserializes the keychain
  - `addAccount(_index: number)`: - Adds an account to the keychain
  - `getAccounts()`: - Returns the accounts in the keychain
  - `getSigner(address: Address)`: -  Returns a signer for the given address
  - `exportAccount(address: Address)` - Returns the private key for the given address
  - `exportKeychain()` - Returns the secret for the entire keychain
  - `removeAccount(address: Address)` - Removes the account for the given address

