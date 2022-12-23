import express from 'express';
import cors from 'cors'

import { PrismaClient } from '@prisma/client'
import { convertHourStringToMinutes } from './utils/conver-hour-string-to-minutes';
import { convertMinutesToHourString } from './utils/conver-minutes-to-hour-string';

const app = express();

app.use(express.json());
app.use(cors()) //em produção configurar a origin ({origin: 'https://dominio.com.br'})

const prisma = new PrismaClient({
    log: ['query']
});

// https://localhost:3333/ads/
app.get("/games", async (request, response) => {
    const games = await prisma.game.findMany({
        include: {
            _count: {
                select: {
                    ads: true
                }
            }
        }
    }); // Método assíncrono
    return response.json(games);
})

app.post("/games/:id/ads", async (request, response) => {
    const gameId = request.params.id;
    const body: any = request.body;
    //validações para retirar o any

    const ad = await prisma.ad.create({
        data: {
            gameId,
            name: body.name,
            yearsPlaying: body.yearsPlaying,
            discord: body.discord,
            weekDays: body.weekDays.join(','),
            hourStart: convertHourStringToMinutes(body.hourStart),
            hourEnd: convertHourStringToMinutes(body.hourEnd),
            useVoiceChannel: body.useVoiceChannel
        }
    })

    return response.status(201).json(ad);
})

app.get("/games/:id/ads", async (request, response) => {
    const gameId = request.params.id;

    
    const ads = await prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            weekDays: true,
            useVoiceChannel: true,
            yearsPlaying: true,
            hourStart: true,
            hourEnd: true
        },
        where:{
            gameId
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return response.json(ads.map(ad => {
        return {
            ...ad,
            weekDays: ad.weekDays.split(','),
            hourStart: convertMinutesToHourString(ad.hourStart),
            hourEnd: convertMinutesToHourString(ad.hourEnd),
        }
    }));
})

app.get("/ads/:id/discord", async (request, response) => {
    const adId = request.params.id;
    
    const ad = await prisma.ad.findUniqueOrThrow({//caso seja nulo dispara um throw
        select: {
            discord: true,
        },
        where: {
            id: adId,
        }
    })
    return response.json({
        discord: ad.discord,
    });
})

app.listen(3333);
// Typescript somente para desenvolvimento, em produção vai ser javascript,
//no caso, npm i typescript -D deve utilizado