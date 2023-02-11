import { Module } from '@nestjs/common';
import { CatController, DogController, WithEmptyController } from './controllers';


@Module({
  controllers: [
    CatController,
    DogController,
    WithEmptyController,
  ],
})
class CatModule {}

@Module({
  imports: [
      CatModule,
  ]
})
export class AppModule {}
