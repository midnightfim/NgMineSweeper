import { Component, OnInit } from '@angular/core';
import { timer, Subscription } from 'rxjs';
import {PlaygroundSection} from "../data/PlaygroundSection";

@Component({
  selector: 'app-core',
  templateUrl: './core.component.html',
  styleUrls: ['./core.component.scss']
})
export class CoreComponent implements OnInit {

  private numRows = 9;
  private numCols = 9;
  private numBombs = 9;
  private numOfClosedAreas: number;

  public playground = [];

  //counter for game
  private subscription:Subscription;
  public counter;

  //check if game is running
  public gameIsRunning: boolean = false;

  constructor() {
  }

  ngOnInit() {
  }

  startOrStopGame(){
    if(!this.gameIsRunning){
      this.startGame();
      this.gameIsRunning = true;
    }else{
      this.gameIsRunning = false;
      this.stopGame(-1, -1);
    }
  }

  // метод для старта игры
  startGame(){
    const source = timer(0,1000);
    this.subscription = source.subscribe(val => this.counter = val);
    // создаем матрицу для хранения всего поля
    for (let i = 0; i < this.numRows; i++) {
      this.playground[i] = [];
      for (let j = 0; j < this.numCols; j++){
        this.playground[i][j] = new PlaygroundSection(i, j, 'closed', 'zero', false);
      }
    }
    // наполняем игровое поле минами
    this.fillUnderLayer(this.playground);
    this.numOfClosedAreas = this.numRows * this.numCols;

  }


  // метод для добавления нижнего слоя в массив playground
  fillUnderLayer (playground: any[]) {
    let underLayerArray = [];
    // заполняем матрицу нулями
    for(let i = 0; i < this.numRows; i++) {
      underLayerArray.push(new Array(this.numCols).fill(0))
    }

    // заполняем матрицу бомбами
    for (let i = 0; i < this.numBombs; i++) {
      let randX = Math.floor(Math.random() * (this.numBombs));
      let randY = Math.floor(Math.random() * (this.numBombs));
      if (underLayerArray[randX][randY] !== 'bomb'){
        underLayerArray[randX][randY] = 'bomb';
      } else {
        i--;
        continue;
      }

      // после того как заполнили бомбами, увеличиваем значения ближайших элементов на 1
      for (let j = 0; j < 3; j++){
        for (let k = 0; k < 3; k++){
          if (randX + j - 1 >= 0 && randX + j - 1 < this.numCols && randY + k - 1 >= 0 && randY + k - 1 < this.numRows) {
            if (underLayerArray[(randX + j - 1)][(randY + k - 1)] !== 'bomb') {
              underLayerArray[(randX + j - 1)][(randY + k - 1)]++;
            }
          }
        }
      }

      // записываем результаты из матрицы underLayerArray в матрицу playground
      for (let i = 0; i < this.numRows; i++){
        for (let j = 0; j < this.numCols; j++){
          if (underLayerArray[i][j] === 'bomb'){
            this.playground[i][j].setUnderPictureUrl(underLayerArray[i][j]);
          } else {
            if (underLayerArray[i][j] !== 0) {
              this.playground[i][j].setUnderPictureUrl('num'+ underLayerArray[i][j]);
            } else {
              this.playground[i][j].setUnderPictureUrl('zero');
            }
          }
        }
      }


    }
  }


  // метод для остановки игры
  stopGame(coordX, coordY){
    // останавливаем таймер
    this.subscription.unsubscribe();
    for (let i = 0; i < this.numRows; i++){
      for (let j = 0; j < this.numCols; j++) {
        // если не флаг - открываем, если флаг, смотрим то внутри
        if (this.playground[i][j].upperAreaValue === 'flaged') {
          if (this.playground[i][j].underAreaValue !== 'bomb'){
            this.playground[i][j].setUpperPictureUrl('nobomb');
          }
        } else {
          this.playground[i][j].isOpen = true;
        }
      }
    }
    if(coordX >= 0) {
      this.playground[coordX][coordY].setUnderPictureUrl('bombed');
    }
  }


  // обработчик для левого клика мышью
  clickTable(event){
    // только если клик по картинке
    if (event.target.localName === 'img') {
      // извлекаем координаты матрицы playground из тега alt
      let coords = event.target.alt.split('');

      if(this.playground[coords[0]][coords[1]].upperAreaValue === 'flaged'){
        return;
      }

      // если клетка закрыта, смотрим что на нижнем уровне
      if (!this.playground[coords[0]][coords[1]].isOpen) {
        switch (this.playground[coords[0]][coords[1]].underAreaValue) {
          case 'bomb':
            // если бомба - завершаем игру
            this.gameIsRunning = false;
            this.stopGame(coords[0], coords[1]);
          case 'zero':
            // если клетка пустая открываем соседние
            this.openNeighboringAreas(Number(coords[0]), Number(coords[1]));
            this.playground[coords[0]][coords[1]].isOpen = true;
          default:
            // если число - открываем
            this.playground[coords[0]][coords[1]].isOpen = true;
        }


        // проверяем сколько открытых ячеек осталось
        this.numOfClosedAreas = this.numRows * this.numCols;
        for (let i = 0; i < this.numRows; i++) {
          for (let j = 0; j < this.numCols; j++) {
            if (this.playground[i][j].isOpen === true) {
              this.numOfClosedAreas--;
              // если колличество открытых ячеек равно колличеству бомб - завершаем игру
              if (this.numOfClosedAreas === this.numBombs) {
                this.gameIsRunning = false;
                this.stopGame(-1, -1);
              }
            }
          }
        }

      }
    }
  }

  // обработчик для правого клика мышью
  putFlagOnPlayground(event){
    if (event.target.localName === 'img') {
      // извлекаем координаты матрицы playground из тега alt
      let coords = event.target.alt.split('');

      if (!this.playground[coords[0]][coords[1]].isOpen) {
        if (this.playground[coords[0]][coords[1]].upperAreaValue === 'flaged') {
          this.playground[coords[0]][coords[1]].setUpperPictureUrl('closed');
        } else {
          this.playground[coords[0]][coords[1]].setUpperPictureUrl('flaged');
        }
      }
    }
    return false;
  }

  // метод для проверки соседних клеток
  openNeighboringAreas = (coordX, coordY) => {
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        // только поля в пределах матрицы и только для закрытых клеток
        if (coordX + i >= 0 && coordX + i < this.numCols && coordY + j >= 0 && coordY + j < this.numRows) {
          let field = this.playground[i + Number(coordX)][j + Number(coordY)];
          // если 1-8 - открываем, если 0 то рекурсируем
          if (!field.isOpen) {
            if (field.underAreaValue !== 'zero') {
              field.isOpen = true;
            } else {
              field.isOpen = true;
              this.openNeighboringAreas(i + Number(coordX), j + Number(coordY));
            }
          }
        }
      }
    }
  }


}
