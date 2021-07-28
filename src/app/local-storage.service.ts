import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  getData(id: string) {
    return JSON.parse(localStorage.getItem(id) || 'null');
  }

  saveData(id: string, data: any) {
    localStorage.setItem(id, JSON.stringify(data));
  }
}
