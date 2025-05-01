export function roundToDecimalsString(num, decimals) {
  return num.toFixed(decimals);
}
export function convertToMp3(fileName) {
  return fileName.replace(/\.wav$/, ".mp3");
}

export const extractDistinctValues = (invoices) => {
  const monthSet = new Set();
  const quarterSet = new Set();
  const yearSet = new Set();
  const productSet = new Set();
  const customerSet = new Set();
  const citySet = new Set();
  const stateSet = new Set();

  invoices.forEach((invoice) => {
    monthSet.add(invoice["[Dim Time].[Month].[Month].[MEMBER_CAPTION]"]);
    quarterSet.add(invoice["[Dim Time].[Quarter].[Quarter].[MEMBER_CAPTION]"]);
    yearSet.add(invoice["[Dim Time].[Year].[Year].[MEMBER_CAPTION]"]);
    productSet.add(
      invoice["[Dim Item].[Item Id].[Item Id].[MEMBER_CAPTION]"]
    );
    customerSet.add(
      invoice[
        "[Dim Customer].[Customer Id].[Customer Id].[MEMBER_CAPTION]"
      ]
    );
    citySet.add(
      invoice["[Dim Customer].[City Id].[City Id].[MEMBER_CAPTION]"]
    );
    stateSet.add(invoice["[Dim Customer].[State].[State].[MEMBER_CAPTION]"]);
  });

  return {
    month: Array.from(monthSet).filter(Boolean),
    quarter: Array.from(quarterSet).filter(Boolean),
    year: Array.from(yearSet).filter(Boolean),
    product: Array.from(productSet).filter(Boolean),
    customer: Array.from(customerSet).filter(Boolean),
    city: Array.from(citySet).filter(Boolean),
    state: Array.from(stateSet).filter(Boolean),
  };
};
