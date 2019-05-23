export class PlaygroundSection {

  public upperAreaValue: string;
  public underAreaValue: string;

  constructor(public coordX: number, public coordY: number,
              public upperPictureUrl: string, public underPictureUrl: string, public isOpen: boolean){

    this.setUpperPictureUrl(upperPictureUrl);
    this.setUnderPictureUrl(underPictureUrl);
  }

  public setUpperPictureUrl(value: string){
    this.upperPictureUrl = 'assets/images/' + value + '.png';
    this.upperAreaValue = value;
  }

  public setUnderPictureUrl(value: string){
    this.underPictureUrl = 'assets/images/' + value + '.png';
    this.underAreaValue = value;
  }

}
