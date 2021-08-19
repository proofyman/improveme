import {Injectable} from '@angular/core';
import {LocalStorageService} from "./local-storage.service";
import {BehaviorSubject, Observable} from "rxjs";

export interface ITag {
  name: string;
}

const TAGS_ID_KEY = 'TAGS_ID_KEY';

@Injectable({
  providedIn: 'root'
})
export class TagsService {
  tags: ITag[] = [];
  tags$ = new BehaviorSubject<ITag[]>([]);

  constructor(
    private localStorageService: LocalStorageService
  ) {
    this.tags = this.localStorageService.getData(TAGS_ID_KEY) || [];
    this.tags$.next(this.tags);
  }

  addTag(value: ITag) {
    this.tags = [...this.tags, value];
    this.localStorageService.saveData(TAGS_ID_KEY, this.tags);
    this.tags$.next(this.tags);
  }

  getTags(): Observable<ITag[]> {
    return this.tags$.asObservable();
  }
}
