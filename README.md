# Money-Tracker
for tan

## Importing pasted transactions

Open **Import / Export**, choose the pasted transaction format, paste one transaction per line, review the preview, then import.

- **Dining Dollars:** paste tab-delimited rows in account, date/time, location, amount order. Dates such as `09/27/26 02:16:21 PM` and signed amounts such as `- $14.79` are supported. Statement debits are converted to positive spending and refunds to negative amounts. Manual entries use the same convention: positive for spending, negative for refunds. The dining balance and pacing dashboard use only the `First Year Limited PCV` account.
- **Credit card:** paste statement rows such as `Aug 27 Aug 28 MERCHANT NAME CITY ST $25.19`. The first date is used with the current year. Fields not present in the statement use the quick-entry defaults: Dining category, blank reason, not reimbursable, and Tanner V. ...8483 payment method.
- **Debit card:** choose Debit card statement in the Import / Export paste importer and paste rows containing a date, description, transaction amount, and ending daily balance. The balance change determines whether the amount is a deposit (positive) or withdrawal (negative). Include the opening balance from the statement, or enter it in the importer, so the first transaction can be classified. The Debit Card tab groups entries by statements running from the 17th through the 16th and supports Quick Add for manual transactions.
- **Payback expenses:** add expenses using **Quick Add — Payback Expense** on the Budget tab. Expenses are separate from credit-card transactions and reduce the net reimbursable balance. Credit- and debit-card transactions marked Reimbursable automatically appear in the Budget tracker, where they can be marked settled. The **Non-reimbursable Category Breakdown** includes only non-reimbursable credit-card transactions. Use **Print / Save PDF** in the Budget tab's tracker to print the selected budget period or save it as a PDF; the report lists reimbursable transactions, reasons, expenses, net payback, and net payback plus the configured monthly budget.

The Budget tab contains the existing monthly budget and payback tracker. Monthly budget spending continues to use credit-card transactions and the existing 19th–18th budget cycle. Reimbursable debit-card transactions feed the payback tracker only.

The existing Dining Dollars CSV upload remains available below the paste importer.
