import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import type { Request, Response } from 'express'
import { NotFoundException, VersioningType } from '@nestjs/common';
import * as url from 'url'

async function bootstrap() {
  /*
  const expressApp = express()

  const prefixed = express.Router()
  prefixed.use('/', (req, res, next) => {
    console.log('Request Type:', req.method, req.path, req.url)
    // next()
    res.redirect(req.url)
    // res.json({
    //   orgId: req.params.organization_id || null
    // })
  })
  expressApp.use('orgs/:organization_id', prefixed)
  */

  // const router = express.Router()
  // router.use('/orgs/:organization_id/', (req, res, next) => {
  //   if (!req.params.organization_id) throw new NotFoundException()
  //   console.log(
  //     req.params,
  //     req.url,
  //     req.path,
  //     req.baseUrl,
  //   );

  //   const realUrl = url.parse(req.url)

  //   const queryParams = new URLSearchParams(realUrl.search || '')
  //   queryParams.delete('organization_id')
  //   queryParams.set('organization_id', req.params.organization_id)

  //   res.redirect('/api/v1' + realUrl.pathname + '?' + queryParams.toString())
  // })
  // expressApp.use('/api/v1', router)

  // expressApp.use('/api/v1/orgs/:organization_id/', (req, res) => {
  //   if (!req.params.organization_id) throw new NotFoundException()

  //   const realUrl = url.parse(req.url)

  //   const queryParams = new URLSearchParams(realUrl.search || '')
  //   queryParams.delete('organization_id')
  //   queryParams.set('organization_id', req.params.organization_id)

  //   res.redirect('/api/v1' + realUrl.pathname + '?' + queryParams.toString())
  // })

  // expressApp.use('/api/v1/orgs/:organization_id', (req, res, next) => {
  // expressApp.use('/api/v1', (req, res, next) => {
  //   console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

  //   console.dir({
  //     url: req.url,
  //     path: req.path,
  //     params: req.params,
  //   });

  //   next()
  // })

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    // new ExpressAdapter(expressApp),
  );

  const expressApp = app.getHttpAdapter().getInstance()
  expressApp.use('/api/v(1|2)/orgs/:organization_id/', (req: Request, res: Response) => {
    if (!req.params.organization_id) throw new NotFoundException()

    // TODO: validar organization_id como UUID, senão 404

    const realUrl = url.parse(req.url)
    const queryParams = new URLSearchParams(realUrl.search || '')
    // Forbids query parameter forgery
    queryParams.delete('organization_id')
    // Using the snake notation here because all controllers must use the camel
    // case notation for query parameters names, thus we're preventing naming collision.
    queryParams.set('organization_id', req.params.organization_id)

    const routeApiVersion = req.params[0]
    const serializedQueryParams = queryParams.toString()
    const realUrlStr =
      `/api/v${routeApiVersion}` +
      realUrl.pathname +
      (serializedQueryParams ? ('?' + serializedQueryParams) : '')

    res.redirect(realUrlStr)
  })


  /*
  const expressApp = app.getHttpAdapter().getInstance()
  const globalPrefix = 'api'
  expressApp.use(`/${globalPrefix}/v1/orgs/:organization_id`, (req, res, next) => {
    console.log('Request Type:', req.method, req.path, req.url)

    res.json({
      orgId: req.params.organization_id || null
    })
  })
  */


  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });

  // const router = express.Router({
  //   // strict: true,
  //   caseSensitive: true,
  //   // Preserve the req.params values from the parent router. If the parent and
  //   // the child have conflicting param names, the child’s value take precedence.
  //   mergeParams: false,
  // })
  // router.all('/orgs/:organization_id/(*)', (req, res, next) => {
  //   res.json({
  //     orgId: req.params.organization_id || null
  //   })
  // })
  // expressApp.all('/', router)



  // const app1Express = app.getHttpAdapter().getInstance()

  // app1Express.mountpath.push('orgs')

  // var admin = express()

  // admin.get('/', function (req, res, next) {
  //   console.dir(req.path) // [ '/adm*n', '/manager' ]
  //   res.send('Admin Homepage')
  //   next()
  // })

  // app.use('/orgs/:organizationId/*', admin)


  // const app2 = await NestFactory.create<NestExpressApplication>(AppModule);
  // const app2Express = app.getHttpAdapter().getInstance()

  // app1Express.use('/orgs', app2Express)


  // console.log('>>>>>>')
  // await app.init()
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
