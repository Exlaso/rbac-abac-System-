import { hash, compare } from 'bcrypt';

export class PasswordUtilsService {
    /**
     * Encrypts a plain text password using bcrypt.
     * @param password - The plain text password to be encrypted.
     * @returns A promise that resolves to the hashed password.
     */
    async encryptPassword(password: string): Promise<string> {
        // Hash the plain text password with a salt round of 10.
        return hash(password, 10);
    }

    /**
     * Compares a plain text password with an encrypted (hashed) password.
     * Useful for verifying user login credentials.
     * @param encryptedText - The hashed password stored in the database.
     * @param plainText - The plain text password entered by the user.
     * @returns A promise that resolves to `true` if the passwords match, otherwise `false`.
     */
    async decryptPassword(encryptedText: string, plainText: string): Promise<boolean> {
        // Compare the plain text password with the hashed password using bcrypt.
        return compare(plainText, encryptedText);
    }
}
