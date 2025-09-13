const { PrismaClient } = require('./generated/prisma')

// use `prisma` in your application to read and write data in your DB

class User{
    constructor(){
        this.prisma = new PrismaClient();
    }

    async add(userObject){
        try{
            await this.prisma.user.create({
                data:userObject,
            });
            console.log(`User ${userObject.email} added successfully`);
        }
        catch(error){
            console.log(error.message);
        }
    }

    async get(userId){
        try{
            const user = await this.prisma.user.findUnique({
                where :{sub : userId},
            })

            return user;
        }
        catch(error){
            console.log(error.message);
        }
    }

    async update(id, data){
        try{
            const user = await this.prisma.user.update({
                where : {sub : id},
                data : data,
            });

            return user;
        }
        catch(error){
            console.log(error.message)
        }
    }

    async doesExist(userId){
        try{
            const user = await this.prisma.user.findUnique({
                where:{
                    sub : userId,
                }
            })

            return !!user;
        }
        catch(error){
            console.log(error.message)
        }
    }
}

module.exports = User;