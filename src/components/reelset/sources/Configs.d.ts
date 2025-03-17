type WinLine = 'diagonal' | 'straight';

interface Payline {
  line: [number, number, number];
  winLineType: WinLine;
  reversed?: boolean;
}
