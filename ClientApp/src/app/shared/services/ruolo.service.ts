import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Ruolo } from '@shared/models/ruolo.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RuoloService {
  constructor(private http: HttpClient) { }

/*   getRuoli(): Observable<Ruolo> {
    return this.http.get<Ruolo>(environment.API_URI+'ruoli');
  } */

}
