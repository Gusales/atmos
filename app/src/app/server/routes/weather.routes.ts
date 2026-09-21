import { Router as ExpressRouter } from 'express'
import { WeatherController } from '../controllers'

const router = ExpressRouter()
const controller = new WeatherController()

const prefix = '/weather'

router.get(prefix, controller.getCurrentWeather)

export const weatherRoutes = router;