
import { Response } from '@nestjs/common';
import { Resolver ,Query, Mutation, Args} from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './Dto/create-auth.dto';
import { AuthInput, DeleteInput, LoginInput, VerifyInput } from './auth.input';
import { CreateJwtDto } from './Dto/create-jwt.dto';

@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService,
  ) {}

  @Query(() => String)
  async helloWorld() {
    try{
        return 'hello';
    }
    catch(error){
        throw new Error(error);
    }
  }
  @Query(()=>[CreateAuthDto])
    async findAll(){
        try{
            
            return await this.authService.findAllResolver();
        }
        catch(error){
            throw new Error(error);
        }
    }

  @Mutation(()=>String)
    async sendToken(@Args('input') authInput:AuthInput ){
      try{
        console.log(1);
          const id = await this.authService.sentTokenResolver(authInput);

          return id;
      }
      catch(error){
        console.log(11);
          throw new Error(error);
      }
    }

  @Mutation(()=>Boolean)
    async verifyMobile(@Args('input') verifyInput:VerifyInput ){
        try{
            return await this.authService.verifyMobileResolver(verifyInput);
        }
        catch(error){
            throw new Error(error);
        }
    }

  @Mutation(()=>Boolean)
    async deleteById(@Args('input') deleteInput:DeleteInput ){
        try{
            return await this.authService.deleteByIdResolver(deleteInput);
        }
        catch(error){
            throw new Error(error);
        }
    }


  @Mutation(()=>CreateJwtDto,{nullable:true})
  async login(@Args('input') loginInput:LoginInput,@Response() response: Response) {

    console.log("login->auth.resolver");

    return this.authService.loginResolver(loginInput,response);
  }

}