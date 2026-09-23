import { Router as ExpressRouter } from 'express'
import { GeoCodingController } from '../controllers'

const router = ExpressRouter()
const controller = new GeoCodingController()

const prefix = '/geocoding'

router.get(prefix, (request, response) => controller.getLocationBySearch(request, response))
router.get(`${prefix}/coordinates`, (request, response) => controller.getLocationByLatitudeAndLongitude(request, response))

export const geocodingRoutes = router;