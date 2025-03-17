import { SizeConfig as Base } from 'gh-client-base';

export class SizeConfig extends Base {

  static get winLineX() {
    return -(SizeConfig.reelsWidth / 2) * 0.92;
  }

  static getWinLineYForRow(row: number) {
    const yOffset = -11;

    return (
      yOffset -
      SizeConfig.symbolHeightWithIndent +
      SizeConfig.symbolHeightWithIndent * row
    );
  }
}
