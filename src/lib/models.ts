export interface Card {
  SetName: string,
  ReleaseDate: string,
  Link: string,
  CardName: string,
  Image: string,
  Values: [{
    Price: number,
    InStock: boolean,
    Finish: string,
  }]
}