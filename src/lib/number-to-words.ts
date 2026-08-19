const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function convertHundreds(n: number): string {
  if (n === 0) return "";
  if (n < 20) return ones[n];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const o = n % 10;
    return tens[t] + (o ? " " + ones[o] : "");
  }
  const h = Math.floor(n / 100);
  const rest = n % 100;
  return ones[h] + " Hundred" + (rest ? " " + convertHundreds(rest) : "");
}

function convertToWords(n: number): string {
  if (n === 0) return "Zero";

  let result = "";
  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const hundred = n;

  if (crore) result += convertHundreds(crore) + " Crore ";
  if (lakh) result += convertHundreds(lakh) + " Lakh ";
  if (thousand) result += convertHundreds(thousand) + " Thousand ";
  if (hundred) result += convertHundreds(hundred);

  return result.trim();
}

export function amountToWords(amount: number): string {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  let result = convertToWords(rupees) + " Rupees";
  if (paise > 0) {
    result += " and " + convertToWords(paise) + " Paise";
  }
  return result + " Only";
}
