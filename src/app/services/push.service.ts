import { Injectable } from '@angular/core';
import { OneSignal, OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { Storage } from '@ionic/storage';
import { EventEmitter } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class PushService {

  mensajes: OSNotificationPayload[] = [
    // {
     // title: 'Titulo de la push',
      // body: 'Este es el body de la push',
      // date: new Date()
    // }
  ];

  userId: string;

  pushListener = new EventEmitter<OSNotificationPayload>();

  constructor(private oneSignal: OneSignal,
              private storage: Storage) {
    this.cargarMensajes();
    }

    async getMensajes() {
      await this.cargarMensajes();
      return [...this.mensajes];
    }

  configuracionInicial() {
    this.oneSignal.startInit('2884883e-5597-4de5-af80-03e7edda42d8', '745592045236');

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

    this.oneSignal.handleNotificationReceived().subscribe(( noti ) => {
  // do something when notification is received
    console.log('Notificacion recibida', noti);
    this.notificacionRecibida( noti );
  });

    this.oneSignal.handleNotificationOpened().subscribe( async (   noti ) => {
  // do something when a notification is opened
    console.log('Notificacion abierta', noti);
    await this.notificacionRecibida( noti.notification );
  });

    // Obtener ID del subscriptor
    this.oneSignal.getIds().then( info => {
      this.userId = info.userId;
      console.log(this.userId);
    });

    this.oneSignal.endInit();
  }

  async notificacionRecibida( noti: OSNotification ) {

    await this.cargarMensajes();

    const payload = noti.payload;

    const existePush = this.mensajes.find( mensaje => mensaje.notificationID === payload.notificationID );
    if (existePush ) {
      return;
    }

    this.mensajes.unshift( payload );
    this.pushListener.emit( payload);

    await this.guardarMensajes();

  }

 async guardarMensajes() {
    this.storage.set( 'mensajes', this.mensajes);
  }

  async cargarMensajes() {

  this.mensajes = await this.storage.get('mensajes') || [];
  // Con esta linea vac??o el storage en tiempo real si lo tengo corriendo -l
  // this.storage.clear();
  return this.mensajes;

  }

  async borrarMensajes() {
    await this.storage.clear();
    this.mensajes = [];
    this.guardarMensajes();
  }

  async borrarMensaje(id) {
    const existe = this.mensajes.find(mensaje => mensaje.notificationID === id);
    console.log('elemento existe', existe);

    if (existe) {
      const indice = this.mensajes.indexOf(existe);
      console.log('indice es ', indice);

      console.log('antes splice ', this.mensajes);
      this.mensajes.splice(indice, 1);
      console.log('despues splice ', this.mensajes);

      await this.guardarMensajes();
    }

  }

}
