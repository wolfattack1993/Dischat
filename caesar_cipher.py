def caesar_cipher(text, shift):
    result = ""
    for char in text:
        if char.isalpha():
            base = ord('A') if char.isupper() else ord('a')
            shifted = (ord(char) - base + shift) % 26 + base
            result += chr(shifted)
        else:
            result += char
    return result

if __name__ == "__main__":
    print("🔐 Caesar Cipher Encoder")
    message = input("Enter your message: ")
    try:
        shift = int(input("Enter shift amount (0–25): "))
        encrypted = caesar_cipher(message, shift)
        print(f"\n🔒 Encrypted message:\n{encrypted}")
    except ValueError:
        print("⚠️ Please enter a valid number for the shift.")
