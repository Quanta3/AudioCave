import 'dotenv/config'
import {google} from 'googleapis';
import User from'./userController.cjs';

class Auth{

    constructor(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI){
        this.CLIENT_ID = CLIENT_ID;
        this.CLIENT_SECRET = CLIENT_SECRET;
        this.REDIRECT_URI = REDIRECT_URI;

        this.user = new User();
    }

    async CreateClient(REFRESH_TOKEN){
        const oauth2Client = new google.auth.OAuth2(
            this.CLIENT_ID,
            this.CLIENT_SECRET,
            this.REDIRECT_URI
        );
        
        if(!!REFRESH_TOKEN)oauth2Client.setCredentials({refresh_token: REFRESH_TOKEN})
        

        return oauth2Client;
    }

    getClientId(){
        return process.env.CLIENT_ID;
    }

    async authorize(authCode){
            const arr = await this.getTokensAndAddToDatabase(authCode)
            return arr;
    }

    async getTokensAndAddToDatabase(authCode){
        const oauth2Client = await this.CreateClient();
        const response = await oauth2Client.getToken(authCode);
        console.log(response.tokens)
        //return [response.data.refresh_token, response.data.id_token, response.data.access_token];
    
        //Get The IdToken
        const idToken = response.tokens.id_token;
        const payload = await this.verifyToken(idToken, oauth2Client);

        const exists = await this.user.doesExist(payload.sub);
        if(!exists)
        {
            this.user.add({
                sub: payload.sub,
                email:payload.email,
                refresh_token: response.tokens.refresh_token,
            })
        }
        else{
            const updateData = {
                email : payload.email
            }
            if(response.tokens.refresh_token){
                updateData.refresh_token = response.tokens.refresh_token;
            }
            await this.user.update(payload.sub, updateData);
        }

        return [payload.sub, response.tokens.access_token];

    }

    async verifyToken(token, oauth2Client){
        const ticket = await oauth2Client.verifyIdToken({
            idToken : token,
            audience : this.CLIENT_ID,
        });

        const payload = ticket.getPayload();
        return payload;
    }

    async getAccessToken(userId){
        const userTuple = await this.user.get(userId);
        if(!userTuple)throw new Error('User Does not Exist');

        const oauth2Client = await this.CreateClient(userTuple.refresh_token)
        
        const response = await oauth2Client.getAccessToken();
        
        return response.token;
    }

    async doesUserExist(userId) {
        const flag = await this.user.doesExist(userId);
        return flag;
    }


}

export default Auth;