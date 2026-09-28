# Money-Tracker
for tan

## Importing pasted transactions

Open **Import / Export**, choose the pasted transaction format, paste one transaction per line, review the preview, then import.

- **Dining Dollars:** paste tab-delimited rows in account, date/time, location, amount order. Dates such as `09/27/26 02:16:21 PM` and signed amounts such as `- $14.79` are supported. Debits retain their negative sign and refunds their positive sign; negative debits increase net spending and positive refunds reduce it. Manual entries use the same signs (negative for spending, positive for refunds). The dining balance and pacing dashboard use only the `First Year Limited PCV` account.
- **Credit card:** paste statement rows such as `Aug 27 Aug 28 MERCHANT NAME CITY ST $25.19`. The first date is used with the current year. Fields not present in the statement use the quick-entry defaults: Dining category, blank reason, not reimbursable, and Tanner V. ...8483 payment method.
- **Payback expenses:** on the Credit Card tab, set Quick Add's **Reimbursement** field to **Expense** and enter a positive cost. Expenses are marked in the transaction table's Reimbursement column, use category N/A, and can have their own payment method. They are deducted from outstanding reimbursement and excluded from card budget/category spending. The **Non-reimbursable Category Breakdown** includes only non-reimbursable transactions. Use **Print / Save PDF** in the payback tracker to print the selected budget period or save it as a PDF; the report lists reimbursable transactions, reasons, expenses, net payback, and net payback plus the configured monthly budget.

The existing Dining Dollars CSV upload remains available below the paste importer.
