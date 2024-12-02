import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { Aree } from '@shared/services/areeservice.service';
import { ModellazioneNuovaComponent } from '../modellazione-nuova/modellazione-nuova.component';
import { ModellazioneAggiornaComponent } from '../modellazione-aggiorna/modellazione-aggiorna.component';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-aree',
  templateUrl: './aree.component.html',
  styleUrls: ['./aree.component.scss'],
})
export class AreeComponent implements OnInit {

  constructor(public dialog: MatDialog,
              private areeSrv: Aree) { }

  displayedColumns: string[] = ['nomeSettoreMaterie','nomeAreaProdotto', 'creato','aggiornato'];
  dataSource: any[] = [];
  filtroStringa = '';
  private searchSubject = new Subject<string>();
  errorMessage: string | null = null;

  //proprietà per paginazione e ordinamento
  pageDim = '20';
  pageCurr = 1;  //pagina corrente
  pageNum = 0;   //numero di pagine
  elemNum = 0;   //numero di elementi totali
  base = 1;      //base per creazione layout
  layoutDim = 6; //elementi paginazione
  layoutNumbers: number[] = []; //numeri del paginatore
  numPages = ['5','10','20','50','100'];  //possibili righe di paginazione
  ordine = '';

  ngOnInit(): void {
    this.inizializzaPaginazione();

    this.searchSubject.pipe(
      debounceTime(500)
    ).subscribe(searchTerm => {
      this.filtroStringa = searchTerm;
      this.pageCurr = 1;
      this.base = 1;
      this.layoutNumbers = [];
      this.inizializzaPaginazione();
    });
  }

  modificaDialog(id: number) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.height = '400px';
    dialogConfig.data = ({formAttivo: 0, id });
    const dialogRef = this.dialog.open(ModellazioneAggiornaComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => {
      this.inizializzaPaginazione();
    });
  }

  nuovaDialog(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.height = '400px';
    dialogConfig.data = 0;
    const dialogRef = this.dialog.open(ModellazioneNuovaComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => {
      this.ordine = '';
      this.inizializzaPaginazione();
    });
  }

  popolaTabella() {
    this.areeSrv.newGetAreeConPaginazione(
      Number(this.pageDim),
      this.ordine,
      this.pageCurr - 1,
      this.filtroStringa
    ).subscribe(
      data => {
        this.dataSource = data;
      },
      error => {
        this.errorMessage = 'Error fetching data';
        // console.error('Error fetching data:', error);
        this.dataSource = [];
      });
  }

  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  azzeraFiltro() {
    this.filtroStringa = '';
    this.pageCurr = 1;
    this.base = 1;
    this.layoutNumbers = [];
    this.inizializzaPaginazione();
  }

  sortData(sort: Sort) {
    this.ordine = '';
    if (sort.direction)
      this.ordine = sort.active + '-' + sort.direction;
    this.popolaTabella();
  }

  pageNext() {
    if (this.pageCurr < this.pageNum) {
      this.pageCurr++;
      this.scorriLayout();
      this.popolaTabella();
    }
  }

  pagePrev() {
    if (this.pageCurr > 1) {
      this.pageCurr--;
      this.scorriLayout();
      this.popolaTabella();
    }
  }

  setPageCurr(page: number) {
    this.pageCurr = page;
    this.popolaTabella();
  }

  resetPaginazione(){
    this.pageCurr = 1;  //pagina corrente
    this.base = 1; //base per creazione layout
    this.layoutDim = 6; //elementi paginazione
    this.layoutNumbers = []; //numeri del paginatore
  }

  inizializzaPaginazione(){
    this.resetPaginazione();
    this.getCountPagineElementi();
  }

  getCountPagineElementi(){
    this.areeSrv.newContaAreeProdotto(this.filtroStringa).subscribe({
      next: data => {
        this.elemNum = data.count;
        this.pageNum = Math.floor(this.elemNum / Number(this.pageDim));
        if ((this.elemNum % Number(this.pageDim)) > 0) this.pageNum++;
        for (let i = 1; i <= 6; i++) {
          if (i <= this.pageNum) {
            this.layoutNumbers.push(i);
          }
        }
        this.popolaTabella();
      },
      error: error => {
        console.error('Error fetching count:', error);
        this.elemNum = 0;
        this.pageNum = 0;
        this.dataSource = [];
      }
    });
  }

  scorriLayout() {
    if ((this.pageCurr >= this.layoutNumbers[this.layoutNumbers.length - 1]) && this.pageCurr < this.pageNum) {
      this.base = this.base + (this.layoutDim - 1);
      this.layoutNumbers = [];
      for (let i = this.base; i < this.base + 6; i++) {
        if (i <= this.pageNum) {
          this.layoutNumbers.push(i);
        }
      }
    } else if ((this.pageCurr <= this.layoutNumbers[0]) && this.pageCurr > 1) {
      this.base = this.base - (this.layoutDim - 1);
      this.layoutNumbers = [];
      for (let i = this.base; i < this.base + 6; i++) {
        if (i <= this.pageNum) {
          this.layoutNumbers.push(i);
        }
      }
    }
    else if (this.pageCurr === 1) {
      this.base = 1;
    }
  }

  pageFirst() {
    if (this.pageCurr > 1) {
      this.pageCurr = 1;
      this.base = 1;
      this.layoutNumbers = Array.from({ length: Math.min(6, this.pageNum) }, (_, i) => i + 1);
      this.popolaTabella();
    }
  }

  pageLast() {
    if (this.pageCurr < this.pageNum) {
      this.pageCurr = this.pageNum;
      this.base = Math.max(1, this.pageNum - 5);
      this.layoutNumbers = Array.from({ length: 6 }, (_, i) => this.base + i).filter(
        k => k <= this.pageNum
      );
      this.popolaTabella();
    }
  }
}
