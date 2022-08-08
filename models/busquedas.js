import fs from 'fs';

//const axios = require('axios');
import axios from 'axios';

class Busquedas {

    historial = [];
    dbPath = './db/database.json';

    constructor() {
        // TODO: leer DB si existe
        this.leerDB();
    }

    //Parametros para mi busqueda por http
    get paramsMapbox(){

        return {
            'access_token': process.env.MAPBOX_KEY,
            'language': 'es',
            'limit': 5
        }

    }

    get paramsOpenWeather(){

        return {
            'appid': process.env.OPENWEATHER_KEY,
            'lang': 'es',
            'units': 'metric'
        }

    }

    get historialCapitalizado(){
        //Capitalizar cada palabra
        return this.historial.map( lugar => {

            let palabras = lugar.split(' ');

            palabras = palabras.map( palabra =>  palabra[0].toUpperCase() + palabra.substring(1) );                        

            return palabras.join(' ');
        })
        
    }

    //metodo async porque debe esperar el resultado de la peticion http a algun servicio para la busqueda de la ciudad
    async ciudad(lugar = '') {

        //peticion http

        try {

            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
                params: this.paramsMapbox
              });

            const resp = await instance.get();
            
            return resp.data.features.map( lugar => ({  //map()  ---> metodo que devuelve un nuevo array con cada elemento separado. Si quiero devolver implicitamente un objeto --->  lugar => ({})
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]
            }))

            //console.log(resp.data.features);
            //Me interesa solo el id, place_name, center[0], center[1] (x e y)
            /**
                {
                    id: 'place.7159025980072860',
                    place_name: 'Buenos Aires, Argentina',
                    center: [ -58.38194, -34.59972 ]
                }    
             */
            //.then(resp => { console.log(resp.data) });

        } catch (error) {
            //Si queres que el programa termine aca tiramos un throw new error
            return [];
        }
        

        //console.log(await axios.get('https://reqres.in/api/users?page=2'));
        //   .then(res => {
        //     console.log(res.data);
        //   });
        // axios.get('ttps://reqres.in/api/users?page=2')
        // .then(res => {
        //     console.log(res.data);
        // });


        //return []; //esto devuelve una lista con todas las coincidencias para ese lugar introducido

    }

    async climaLugar(lat, lng){

        try {
            
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}`,
                params: this.paramsOpenWeather  // {...this.paramsOpenWeather, lat, lan} tambien le agrego los parametros que paso por el argumento
              });

            
            // const resp = await axios.get('https://api.openweathermap.org/data/2.5/weather?lat=-34.59972&lon=-58.38194&appid=fe0e9754c66516d1676c28ba7ee5b993&lang=es&units=metric');
            const resp = await instance.get();
            const { weather, main} = resp.data
              
            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }

            // return {
            //     desc: resp.data.weather[0].description,
            //     min: resp.data.main.temp_min,
            //     max: resp.data.main.temp_max,
            //     temp: resp.data.main.temp
            // }


            // console.log(resp.data);
            /**
             * {
                coord: { lon: -58.3819, lat: -34.5997 },
                weather: [
                    {
                    id: 801,
                    main: 'Clouds',
                    description: 'algo de nubes',
                    icon: '02n'
                    }
                ],
                base: 'stations',
                main: {
                    temp: 13.56,
                    feels_like: 13.32,
                    temp_min: 12.84,
                    temp_max: 14.42,
                    pressure: 1016,
                    humidity: 90
                },
                visibility: 9000,
                wind: { speed: 4.12, deg: 130 },
                clouds: { all: 20 },
                dt: 1659485986,
                sys: {
                    type: 1,
                    id: 8224,
                    country: 'AR',
                    sunrise: 1659437183,
                    sunset: 1659474785
                },
                timezone: -10800,
                id: 6693229,
                name: 'San Nicolas',
                cod: 200
                }

             */

        } catch (error) {
            console.log(error);
        }

    }

    agregarHistorial( lugar = '' ){

        //verificar que no haya lugares duplicados en el historial
        if(this.historial.includes( lugar.toLocaleLowerCase() ) ){ //lo paso a minuscula para hacer mas facil la busqueda de lugares duplicados
            return;
        }

        this.historial.unshift( lugar.toLocaleLowerCase() );

        //Grabar en DB
        this.guardarDB();

    }

    guardarDB(){

        //Creamos una constante por si tenemos mas propiedades 
        const payload = {
            historial: this.historial
        }

        fs.writeFileSync(this.dbPath, JSON.stringify(payload));

    }

    leerDB(){

        if (!fs.existsSync(this.dbPath))
            return 'No existe el file';

        const info = fs.readFileSync(this.dbPath, { encoding: 'utf-8' });
        const data = JSON.parse(info);

        this.historial = data.historial;
    }
}


export { Busquedas };