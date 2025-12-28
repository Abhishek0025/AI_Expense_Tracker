# Testing Checklist

## ✅ Completed Features to Test

### 1. Toast Notification System
- [ ] Test success toast (create transaction)
- [ ] Test error toast (invalid input)
- [ ] Test info toast (AI categorization info)
- [ ] Test warning toast (if any)
- [ ] Verify toasts auto-dismiss after 5 seconds
- [ ] Verify toasts can be manually closed
- [ ] Verify multiple toasts stack correctly

### 2. Edit/Delete Transactions
- [ ] Click "Edit" button on a transaction
- [ ] Verify modal opens with pre-filled data
- [ ] Update transaction fields
- [ ] Save changes and verify toast notification
- [ ] Verify transaction updates in table
- [ ] Click "Delete" button on a transaction
- [ ] Verify confirmation dialog appears
- [ ] Confirm deletion and verify toast notification
- [ ] Verify transaction is removed from table
- [ ] Test canceling edit modal
- [ ] Test canceling delete confirmation

### 3. Search Functionality
- [ ] Type in search bar
- [ ] Verify real-time filtering
- [ ] Search by description
- [ ] Search by merchant
- [ ] Search by category
- [ ] Verify search is case-insensitive
- [ ] Clear search and verify all transactions show
- [ ] Test search with special characters

### 4. Filter and Sort
- [ ] Select category filter
- [ ] Select "Uncategorized" filter
- [ ] Select date range filter (Today, Week, Month, Year)
- [ ] Verify filters work together
- [ ] Sort by Date (ascending/descending)
- [ ] Sort by Amount (ascending/descending)
- [ ] Sort by Description (ascending/descending)
- [ ] Toggle sort order button
- [ ] Click "Clear all filters"
- [ ] Verify pagination resets when filters change

### 5. Dashboard Date Range Selector
- [ ] Select "Today" date range
- [ ] Select "Last 7 Days" date range
- [ ] Select "Last 30 Days" date range
- [ ] Select "Last 3 Months" date range
- [ ] Select "Last 6 Months" date range
- [ ] Select "Last Year" date range
- [ ] Select "All Time" date range
- [ ] Verify KPIs update based on date range
- [ ] Verify charts update based on date range
- [ ] Verify spend by category updates
- [ ] Verify top merchants updates
- [ ] Verify monthly trend chart (should show last 6 months)

## 🧪 Test Scenarios

### Scenario 1: Create and Edit Transaction
1. Navigate to `/transactions/new`
2. Fill in form with test data
3. Submit and verify success toast
4. Go to transactions page
5. Find the transaction
6. Click "Edit"
7. Modify description and amount
8. Save and verify toast
9. Verify changes in table

### Scenario 2: Search and Filter
1. Go to transactions page
2. Type "groceries" in search
3. Verify filtered results
4. Select "Groceries" category filter
5. Select "Last 30 Days" date filter
6. Verify combined filters work
7. Sort by amount descending
8. Clear all filters
9. Verify all transactions show

### Scenario 3: Delete Transaction
1. Go to transactions page
2. Find a transaction
3. Click "Delete"
4. Cancel in confirmation dialog
5. Verify transaction still exists
6. Click "Delete" again
7. Confirm deletion
8. Verify success toast
9. Verify transaction removed

### Scenario 4: Dashboard Date Range
1. Navigate to `/dashboard`
2. Note current KPIs
3. Select "Last 7 Days"
4. Verify KPIs update
5. Select "All Time"
6. Verify all data shows
7. Select "Last 30 Days"
8. Verify charts update

### Scenario 5: AI Categorization
1. Create an uncategorized transaction
2. Go to transactions page
3. Click "AI Categorize" button
4. Verify processing state
5. Wait for completion
6. Verify success toast with count
7. Verify transaction is categorized
8. Verify confidence score (if shown)

## 🐛 Edge Cases to Test

- [ ] Edit transaction with invalid data (should show error toast)
- [ ] Delete transaction that doesn't exist (should show error)
- [ ] Search with empty string
- [ ] Filter with no matching results
- [ ] Sort empty transaction list
- [ ] Dashboard with no transactions
- [ ] Dashboard with date range that has no data
- [ ] Multiple rapid edits/deletes
- [ ] Network error handling (if possible)

## 📱 Responsive Testing

- [ ] Test on mobile viewport
- [ ] Verify filters stack correctly on mobile
- [ ] Verify edit modal is responsive
- [ ] Verify toast notifications on mobile
- [ ] Verify dashboard date selector on mobile

## ⚡ Performance Testing

- [ ] Test with large number of transactions (100+)
- [ ] Verify search is fast
- [ ] Verify filters are fast
- [ ] Verify pagination works smoothly
- [ ] Verify dashboard loads quickly

