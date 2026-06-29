# Manual End-to-End Testing Guide & Checklist

This guide provides step-by-step instructions and a comprehensive checklist for manually testing the Booking Platform website before going live. It covers both **Positive** (happy path) and **Negative** (error handling) test cases, including all the latest production features like Image Uploads, Emails, Password Resets, and Owner Onboarding.

---

## 🚀 Prerequisites: Starting the Local Environment

Before you begin testing, ensure all parts of the application are running locally.

1. **Start MongoDB**: Ensure your MongoDB server is running or you have your MongoDB Atlas URI configured in your backend `.env` file.
2. **Start the Backend server**:
   ```bash
   cd "d:\Booking Platform\backend"
   npm run dev
   ```
   *(Ensure it says "Server running on port 5001" and "Connected to MongoDB")*
3. **Start the Web Frontend**:
   ```bash
   cd "d:\Booking Platform\frontend"
   npm run dev
   ```
4. **Open your browser** and navigate to `http://localhost:5173`.

---

## ✅ The Testing Checklist

You can use the checkboxes below to track your progress as you test the platform.

### 1. Authentication & Password Reset Flow

**Positive Tests:**
- [ ] **Customer Registration:** Navigate to the Signup page. Fill in a valid email and password. Verify you are redirected to the customer dashboard.
- [ ] **Login:** Log out. Return to the Login page. Enter the credentials you just created. Verify successful login.
- [ ] **Forgot Password Link:** On the Login page, click "Forgot Password?". Enter your email address and submit.
- [ ] **Email Receipt:** Check the backend terminal console. Find the Ethereal "Preview URL" and open it in your browser. Verify the HTML password reset email is beautiful and contains a reset link.
- [ ] **Reset Password:** Click the reset link in the email. You should be taken to the `/reset-password` page. Enter a new password. Verify it updates successfully and you can log in with the new password.

**Negative Tests:**
- [ ] **Invalid Credentials:** Try logging in with a non-existent email or wrong password. Verify an error message ("Invalid Credentials") is displayed.
- [ ] **Expired Reset Token:** Wait for 1 hour (or manually change the DB expiration time) and try to use an old reset link. Verify the system rejects it.
- [ ] **Mismatched Passwords:** On the Reset Password screen, enter two different passwords. Verify the form prevents submission.

### 2. Owner Onboarding Flow (Enquiry to Approval)

**Positive Tests:**
- [ ] **Submit Enquiry:** As a guest (not logged in), click "Register your Homestay" on the Navbar. Fill out the application form. Include real image files by dragging and dropping them into the Cloudinary Image Upload box. Click Submit.
- [ ] **Admin Review:** Log in as an Admin (`/admin/login`). Go to the "Pending Approvals" tab in the dashboard. Verify the new property enquiry is there.
- [ ] **Approve & Onboard:** Click "Approve & Onboard" on the pending property. Verify the property moves to the "Active Properties" list.
- [ ] **Welcome Email:** Check the backend terminal console for the Ethereal "Preview URL". Open it and verify the Owner received a "Welcome to StayHub!" HTML email containing their auto-generated temporary password and dashboard link.
- [ ] **Owner First Login:** Log out of Admin. Go to the Owner Login page. Log in using the email used in the enquiry and the temporary password from the email. Verify access to the Owner Dashboard.

### 3. Property Management (Cloudinary Image Uploads)

*Pre-condition: Log in with an "Admin" or "Owner" account.*

**Positive Tests:**
- [ ] **Create Property via Admin:** As Admin, click "+ Add Property". Fill out details. Drag and drop multiple real image files into the Image Upload box. Verify a loading spinner appears, and thumbnails show up once uploaded. Save the property.
- [ ] **Frontend Verification:** Go to the Customer homepage. Verify the newly added property (and its real images) are visible in the "Featured Properties" section.
- [ ] **Edit Property:** Select a property and click "Edit". Add an additional image via the drag-and-drop box. Delete an existing image by clicking the red 'X' on the thumbnail. Save. Verify changes persist.

**Negative Tests:**
- [ ] **Max File Limit:** Try dragging and dropping more than 5 images at once into the Image Upload box. Verify an error message prevents the upload ("You can only upload up to 5 images").

### 4. Customer Flow (Browsing & Booking)

*Pre-condition: Log in with a "Customer" account. Ensure at least one property exists in the database.*

**Positive Tests:**
- [ ] **View All Properties:** Navigate to the Home page. Verify all active properties are listed in the Featured section (not just hotels).
- [ ] **Search functionality:** Type a city name into the search bar. Verify the autocomplete dropdown appears and filtering works.
- [ ] **Initiate Booking:** On a property details page, select Check-in and Check-out dates. Verify the total price calculates correctly. Click "Book Now".
- [ ] **Payment Success:** Complete the payment using Razorpay test credentials. Verify you see the "Booking Confirmed" screen.
- [ ] **Confirmation Emails:** Check the backend terminal console for Ethereal "Preview URLs". Verify TWO emails were sent:
    1. A beautiful HTML "Booking Confirmation" email to the Customer.
    2. A "New Reservation Received" HTML notification email to the Property Owner.

**Negative Tests:**
- [ ] **Invalid Dates:** Try to select a Check-out date that occurs *before* the Check-in date. Verify the date picker prevents this.
- [ ] **Unauthenticated Booking:** Log out entirely. Browse to a property and try to click "Book Now". Verify you are prompted to log in before proceeding.

### 5. Payment Gateway (Razorpay - Test Mode)

*Pre-condition: Ensure Razorpay test keys are in your `.env` files.*

**Positive Tests:**
- [ ] **Test Payment Success:** Enter Razorpay's test card details (e.g., Card Number `4111 1111 1111 1111`, any future expiry, any CVV). Click pay. 

**Negative Tests:**
- [ ] **Test Payment Failure:** Initiate checkout. When the Razorpay popup asks to simulate the response, click "Failure". Verify your website catches the error and shows a "Payment Failed" message.
- [ ] **Cancel Modal:** Initiate checkout. When the Razorpay modal appears, click the "X" to close it without paying. Verify the booking is not processed and no money is deducted.

---

## 📝 Reporting Bugs
If any of the **Negative** tests fail to stop you, or any of the **Positive** tests don't work as described, make a note of:
1. What you clicked.
2. What you expected to happen.
3. What actually happened (include screenshots or error messages from the browser console).
