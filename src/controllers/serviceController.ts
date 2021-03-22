import { Request, Response } from 'express';

export const getPage404 = async (req: Request, res: Response) => {
    let url = req.baseUrl;
    res.status(404).render('404', { url: url });
}

export const getErrorPage = async (req: Request, res: Response) => {
    res.status(404).render('error');
}