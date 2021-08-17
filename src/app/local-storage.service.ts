import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  getData(id: string) {
    return JSON.parse(localStorage.getItem(id) || 'null');
  }

  getRawData(id: string) {
    return localStorage.getItem(id);
  }

  saveData(id: string, data: any) {
    localStorage.setItem(id, JSON.stringify(data));
  }
}
