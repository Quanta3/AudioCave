import {google} from 'googleapis'
import fs from 'fs';
import { YtDlp } from 'ytdlp-nodejs';
import {Readable} from 'stream';    
import { Buffer } from "buffer";



class Api{

    constructor(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI){
        this.CLIENT_ID = CLIENT_ID;
        this.CLIENT_SECRET = CLIENT_SECRET;
        this.REDIRECT_URI = REDIRECT_URI;

    }

    async CreateClient(ACCESS_TOKEN){
        const oauth2Client = new google.auth.OAuth2(
            this.CLIENT_ID,
            this.CLIENT_SECRET,
            this.REDIRECT_URI
        );
        
        oauth2Client.setCredentials({access_token: ACCESS_TOKEN})
        
        const drive = google.drive({
            version:'v3',
            auth: oauth2Client
        })

        return drive;
    }
    async ListFiles(token){
        try{
            console.log("Token " + token);
            const drive = await this.CreateClient(token)
            const response = await drive.files.list({
                q:`trashed=false`
            })
            console.log(response.data);
            return response.data;
        }
        catch(error){
            console.log(error.message)
            throw error;
        }
    }
    
    async CreateFolder(token, name){
        try{
            const drive = this.CreateClient(token);
            const response = await drive.files.create({
                requestBody:{
                    name:name,
                    mimeType : 'application/vnd.google-apps.folder'
                }
            })
            console.log(response.data);
            return response.data;
        }
        catch(error){
            console.log(error.message)
        }
    }
    
    async UploadYoutubeFile(token, name, url){
        try{
            
            const drive = await this.CreateClient(token);
            const parent = await this.getFileId(drive, 'AudioCave');
            console.log(parent);
            const file = await this.getYoutubeFile(url)
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const readableStream = Readable.from(buffer);

            const response =await drive.files.create({
                requestBody : {
                    name : name,
                    mimeType : 'audio/mp3',
                    parents :[parent]
                },
                media : {
                    mimeType : 'audio/mp3',
                    body : readableStream
                }
            })
    
            console.log(response.data)
            return response.data
        }
        catch(error){
            console.log(error.message)
        }
    }
    
    async UploadFile(token, name, link){
        try{
            const drive = await this.CreateClient(token)

            const parent = await this.getFileId(drive, 'AudioCave')
            console.log(parent);

            if (!parent) {
                throw new Error('AudioCave folder not found. Please create the folder first.');
            }
            
            const ytDlpWrap = new YTDlpWrap();
            ytDlpWrap.setBinaryPath('usr/bin/yt-dlp');
            console.log(ytDlpWrap);
            const readableStream = ytDlpWrap.execStream([
                link,
                "-f", "bestaudio",
                "--extract-audio",
                "--audio-format", "mp3",
                "-o", "-" // output to stdout
            ]);

            const response = await drive.files.create({
                requestBody : {
                    name : name,
                    mimeType : 'audio/mpeg',
                    parents :[parent]
                },
                media : {
                    mimeType : 'audio/mpeg',
                    body : readableStream
                }
            })

            console.log(response.data)
            return response.data
        }
        catch(error){
            console.log(error.message)
        }
    }
    
    async DeleteFile(token, fileName){
        try{
            const drive = this.CreateClient(token);
            const fileId = await this.getFileId(drive, fileName);
            if(fileId === null){
                return;
            }
            const response = await drive.files.delete({
                fileId : fileId
            })

            return response.data;
        }
        catch(error){
            console.log(error.message)
        }
    }
    
    async getFileId(drive, fileName){
        try{
            
            const response = await drive.files.list({
                q:`name='${fileName}' and trashed=false`,
                fields: 'files(id, name)'
            })
            
            
            const files = response.data.files;
            
            if (!files || files.length === 0) {
            console.log(`No file found with name: ${fileName}`);
            return null;
            }
            return files[0]['id'];
        }
        catch(error){
            console.log(error.message)
        }
    }

    async getYoutubeFile(url) {
        console.log("Downloading File");
        const ytdlp = new YtDlp();
        const file = await ytdlp.getFileAsync(url, {
            format: "bestaudio",  // best audio available
            filename: "custom-video.%(ext)s",
            noPlaylist: true,
            postprocessorArgs: [["-x", "--audio-format", "mp3"]], // 🔑 force mp3 via ffmpeg
            onProgress: (progress) => {
            if (progress.status === "finished") {
                console.log("Download finished:", progress);
            }
            },
        });

        return file;
    }

    async getReadableStream(token, fileName){
        try{
            const drive = await this.CreateClient(token);
            const fileId = await this.getFileId(drive, fileName);

            console.log(fileId);
            const file = await drive.files.get({
                fileId : fileId,
                alt: 'media'
            }, {
                responseType : 'stream'
            })

            return file
        }
        catch(error){
            console.log(error.message);
        }
    }
}

export default Api;