import path from 'path';
import { Request } from 'express';
import { rootFolder } from '../../server';
import fileUpload from 'express-fileupload';
import _fs from 'fs';
const fs = _fs.promises;
import { fileRespondType } from '../../types/types';

class File {
    private file: fileUpload.UploadedFile | null = null;
    private publicDirectory = 'public';
    private defaultDir = path.join('images', 'books');
    private defaultName: string = '';
    private originalName: string = '';
    private storeFolder: string = '';

    constructor(req: Request, private fieldName: string) {
        this.file = this.extractFile(req);
        if (this.isFileValid()) {
            this.originalName = this.extractName();
            this.defaultName = this.generateName();
        }
    }

    public store(folder: string) {
        this.storeFolder = folder;
        return this;
    }

    public withName(filename: string) {
        this.defaultName = `${filename}.${this.extractExtension()}`;
        return this;
    }

    public leaveName() {
        this.defaultName = this.originalName;
        return this;
    }

    public upload(): Promise<fileRespondType> {
        return new Promise((resolve, reject) => {
            if (!this.isFileValid()) {
                return this.respond(false);
            }
    
            this.file!.mv(path.join(this.getDirToStore(), this.defaultName), async err => {
                if (err) {
                    reject(err);
                }
                resolve(this.respond(true));
            });
        });
    }

    public delete() {
        let filePath = this.getDirToStore();
        this.deleteFile(filePath);
    }

    public deleteFromPublic(relativePath: string) {
        let filePath = path.join(rootFolder, this.publicDirectory, this.fieldName);
        this.deleteFile(filePath);
    }

    private async deleteFile(file: string) {
        try {
            await fs.unlink(file);
        } catch (error) {
            return error;
        }
    }

    public async copy(copyTo:string){
        await fs.copyFile(this.fieldName, copyTo)
    }

    public read(): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                let result = fs.readFile(this.getAbsolutePath());
                resolve(result.toString());
            } catch (error) {
                reject(error);
            }
        });
    }

    private getDirToStore() {
        return this.storeFolder === ''
            ? path.join(rootFolder, this.publicDirectory, this.defaultDir)
            : this.storeFolder;
    }

    private isFileValid() {
        return this.file !== null;
    }

    private respond(isSuccess: boolean) {
        return {
            status: isSuccess,
            filename: isSuccess ? this.defaultName : '',
            store: isSuccess ? this.defaultDir : '',
            relativePath: isSuccess ? this.getRelativePath() : '',
            absolutPath: isSuccess ? this.getAbsolutePath() : '',
        };
    }

    private generateName() {
        let random = this.generateRandomString();
        let extension = this.extractExtension();
        return `${random}${this.file?.md5}.${extension}`;
    }

    private extractExtension() {
        return this.originalName ? this.originalName.split('.').pop() : '';
    }

    private generateRandomString() {
        return process.hrtime.bigint() + (Math.floor(Math.random() * 100)).toString(32);
    }

    private extractFile(req: Request) {
        return req.files ? req.files[this.fieldName] : null;
    }

    private extractName() {
        return this.file !== null ? this.file?.name : '';
    }

    private getRelativePath() {
        return path.join(path.sep, this.defaultDir, this.defaultName);
    }

    private getAbsolutePath(){
        return path.join(this.getDirToStore(), this.defaultName)
    }

}

export { File };