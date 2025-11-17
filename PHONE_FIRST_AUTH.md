# Simplified Authentication System for Congo Users

## Overview
This system has been updated to make registration easier for Congo users who may not be tech-savvy or have regular email access. The system can auto-generate emails if users don't have one.

## Key Changes

### 1. Registration Flow
**Before:**
- Users entered: Name, Email, Password

**After:**
- Users enter: First Name, Last Name, Email (optional), Phone Number, Location/Town, Password
- If email is not provided, system automatically generates: `firstname.lastname@marchecd.com`
- If duplicate names exist, adds incrementing number: `firstname.lastname1@marchecd.com`, etc.
- Location/Town is now required during registration

### 2. Login Flow
- Users log in with: Email + Password
- Simple and straightforward - no phone number login to avoid confusion

### 3. Profile Display
- Prominent yellow banner showing login credentials
- Users are warned to write down their email for future logins
- Banner is always visible to remind users of their login information

## Technical Implementation

### Files Modified

1. **app/auth/register.tsx**
   - Changed from single name field to first name + last name
   - Replaced email input with phone number input
   - Added `generateEmail()` function to create unique emails
   - Validates phone number format (+243 or 0)

2. **app/auth/login.tsx**
   - Changed email field to accept phone number or email
   - Added logic to lookup email from phone number
   - Updated placeholder text and icons

3. **contexts/AuthContext.tsx**
   - Updated `signUp()` to accept optional phone parameter
   - Phone number is now stored during registration

4. **app/(tabs)/profile.tsx**
   - Added blue banner to display generated email
   - Shows only for emails ending in @marchecd.com
   - Includes helpful hint about login options

5. **app/edit-profile.tsx**
   - Added generated email display at top of form
   - Shows email is auto-generated
   - Added hint for phone number field

## User Experience

### Registration
1. User enters first name (e.g., "Jean")
2. User enters last name (e.g., "Kabongo")
3. User optionally enters email (can skip if they don't have one)
4. User enters phone number (e.g., "+243812345678")
5. User enters their town/city (e.g., "Kinshasa")
6. User creates password
7. If no email provided, system generates: `jean.kabongo@marchecd.com`
8. User is registered and logged in

### Login
- Users log in with: Email + Password
- Simple and clear - just email and password

### Profile
- Prominent yellow warning banner at top showing login email
- Users are reminded to write down their credentials
- Phone number and location displayed
- Banner is always visible for easy reference

## Benefits

1. **Accessibility**: Users without email can still register
2. **Simplicity**: Clear, straightforward login with just email and password
3. **Flexibility**: Users can provide their own email or let system generate one
4. **Automatic**: Email generation is seamless for users without email
5. **Unique**: Duplicate name handling ensures every user gets a unique email
6. **Location Aware**: Town/city is collected during registration for better user experience
7. **Clear Reminders**: Prominent banner reminds users of their login credentials

## Database Schema

No database changes required. The existing `users` table already has:
- `email` field (stores generated email)
- `phone` field (stores user's phone number)
- `name` field (stores full name)

## Future Enhancements

Potential improvements:
1. SMS verification for phone numbers
2. Allow users to add their own email later
3. Phone number formatting/validation improvements
4. Support for multiple phone numbers
