import { Router as ExpressRouter } from 'express'
import { WeatherController } from '../controllers'

const router = ExpressRouter()
const controller = new WeatherController()

const prefix = '/weather'

router.get(prefix, (request, response) => controller.getWeather(request, response))

export const weatherRoutes = router;