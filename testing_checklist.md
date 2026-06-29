# StayHub End-to-End Manual Testing Checklist

Use this checklist to manually test every flow of the application to ensure it is production-ready. The platform has three distinct user roles (Customer, Admin, and Owner), so testing is divided into three sections.

---

## 1. Public & Customer Experience 👤

### Authentication & Profile
- `[ ]` **Sign Up:** Create a new customer account via `/register`.
- `[ ]` **Login/Logout:** Verify you can log in, and that logging out redirects you to the home page securely.
- `[ ]` **Dashboard:** Go to "My Profile & Bookings" from the Navbar and verify it loads your information.

### Search & Discovery
- `[ ]` **Homepage Search:** Search for a specific city (e.g., "Goa") from the hero search bar and ensure it filters correctly.
- `[ ]` **Property Filters:** Click on the "Hotels" and "Homestays" links in the navbar and ensure the property list filters by type.
- `[ ]` **Inactive Properties:** Ensure that properties deactivated by the Admin do NOT appear in the public search or property list.

### The Booking Flow (Crucial)
- `[ ]` **Property Details:** Click on any property to view its details.
- `[ ]` **Date Selection:** Pick a Check-in and Check-out date.
- `[ ]` **Dynamic Inventory Check:** Look at the Room Types list. The "Available Rooms" count should update based on the dates you selected. (If you book 5 standard rooms, the next person should see 5 fewer available for those dates).
- `[ ]` **Checkout Page:** Select a room, choose quantity, and proceed to checkout.
- `[ ]` **Form Validation:** Try to submit the checkout form without filling required fields.
- `[ ]` **GST & Corporate Details:** Add optional GST and Company Name.
- `[ ]` **Completion:** Submit the booking using "Pay at Hotel". Verify you are redirected to the success screen and the booking appears in your Customer Dashboard.

---

## 2. Admin Portal 🛡️
*Log in at `/admin/login` using your admin credentials (e.g., `admin@example.com`).*

### Overview & Metrics
- `[ ]` **Stats Accuracy:** Verify that the Total Revenue, Active Properties, Total Bookings, and User counts reflect the current database state.
- `[ ]` **Quick Filters:** Click the "Upcoming", "Checked Out", and "Cancelled" metric cards to ensure they instantly filter the recent bookings table.

### Property Management & Onboarding
- `[ ]` **Property Enquiry (Customer Side):** Open an incognito window, go to "Register your Hotel", fill out the form, and submit it.
- `[ ]` **Onboarding Approval:** In the Admin dashboard -> Properties tab, find the enquiry you just submitted. It should be "Inactive" and have an **"Approve & Onboard"** button.
- `[ ]` **Generate Owner:** Click "Approve & Onboard". Verify the success popup displays the auto-generated Owner Email and Temporary Password.
- `[ ]` **Toggle Status:** Toggle a property between Active and Inactive. Verify it disappears from the customer-facing website when inactive.
- `[ ]` **Edit Property:** Click "Edit" on a property. Add a new `Room Type` (e.g., "Presidential Suite") and save. Verify the changes appear on the live site.

### Bookings & Users
- `[ ]` **View Bookings:** Go to the Bookings tab. Verify you can see GST details and payment methods for all platform bookings.
- `[ ]` **User Filtering:** Go to the Users tab. Test the filters (Customers, Owners, Admins) to ensure users are categorised correctly.

---

## 3. Owner Portal 🏢
*Log in at `/owner/login` using the temporary credentials the Admin generated during the onboarding step.*

### Dashboard & Analytics
- `[ ]` **Isolated Stats:** Verify the Total Revenue, Estimated Payout, and Booking metrics ONLY show numbers for this specific owner's properties, not the whole platform.

### Property Portfolio
- `[ ]` **My Properties:** Go to the "My Properties" tab. Verify the newly onboarded property is displayed.
- `[ ]` **Margin Verification:** Check that the "Your Net Rate" and "Platform Sell Rate" are clearly displayed.

### Booking Management
- `[ ]` **Booking Isolation:** Go to the "Bookings" tab. Ensure the owner can ONLY see bookings made for their specific properties.
- `[ ]` **Real-time Sync:** Make a new booking as a customer on the public site for this owner's property. Refresh the Owner Dashboard and verify the booking appears immediately under the "Upcoming" filter.

---

> [!TIP]
> **Need to reset your testing environment?** 
> You can wipe the database clean and start over with fresh mock data at any time by running `node seed.js` in your backend terminal!
