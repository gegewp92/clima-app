import 'dotenv/config';

import { inquirerMenu, leerInput, pausa, listarLugares } from "./helpers/inquirer.js";
import { Busquedas } from "./models/busquedas.js";

// console.log(process.env.MAPBOX_KEY);

const main = async() => {

    const busquedas = new Busquedas();
    let opt;

    do {

        opt = await inquirerMenu();

        switch (opt) {

            case 1:
                //step1: Mostrar mensaje para que el user introduzca el lugar que quiere buscar
                const lugar = await leerInput('Ciudad: ');
                
                
                //step2: Busqueda de los lugares. Con el resultado del lugar voy a llamar al API y este me devolvera la info de todas las ciudades que coincidad con mi lugar
                const busqueda = await busquedas.ciudad(lugar);
                //console.log(busqueda);


                //step3: Seleccionar el lugar(resultado de las busquedas)
                const id = await listarLugares(busqueda);
                //console.log({id});

                // Si la opcion es 0 -> Cancelar, continua con la siguiente iteracion
                if (id === '0') continue;

                //step3.1: Saco los valores de la lat y lng para mostrar los resultados finales
                const lugarSeleccionado = busqueda.find( l => {
                   return l.id === id
                });
                //console.log(lugarSeleccionado); --> devuelve toda la data(nombre, lat, lns)

                //3.2 Guardar en DB para el historial. Solo me interesa el nombre
                busquedas.agregarHistorial(lugarSeleccionado.nombre);

                //step4: Una vez seleccionado el lugar, voy a mostrar los datos del clima(geolocation)
                const clima = await busquedas.climaLugar(lugarSeleccionado.lat, lugarSeleccionado.lng);
                //console.log(clima);

                //step5: Mostrar resultados de la ciudad y el clima seleccionados
                console.log('\nInformación de la ciudad:\n'.green);
                console.log('Ciudad:', lugarSeleccionado.nombre.green);
                console.log('Lat:', lugarSeleccionado.lat);
                console.log('Lng:', lugarSeleccionado.lng);
                console.log('Temperatura:', clima.temp);
                console.log('Mìnima:', clima.min);
                console.log('Máxima:', clima.max);
                console.log('Como esta el clima:', clima.desc.green);

            break;
                

            case 2:
                //Mostrar el historial
                busquedas.historialCapitalizado.forEach((lugar, i) => {
                    
                    let index = `${i + 1}.`.green;

                    console.log(` ${index} ${lugar} `);

                })

            break;
        
        }

        if (opt !== 0) await pausa();

    } while (opt !== 0);

}

main();