import { Component, OnInit, ApplicationRef } from '@angular/core';
import { PushService } from '../services/push.service';
import { OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  mensajes: OSNotificationPayload[] = [];

  constructor(public pushService: PushService,
              private applicationRef: ApplicationRef,
              private socialSharing: SocialSharing,
              public alertController: AlertController ) {}

  ngOnInit() {
    this.pushService.pushListener.subscribe( noti => {
      this.mensajes.unshift( noti );
      this.applicationRef.tick();
  });
  }

async ionViewWillEnter() {

  console.log('Will Enter - Cargar mensajes');
  this.mensajes = await this.pushService.getMensajes();

  console.log('idPush - ', this.pushService.userId);

  this.mensajes.forEach(mensaje => {
    console.log(mensaje);
  });
  // Seteo falso default de checked,sino es undefined
  this.mensajes.forEach(mensaje => {
    mensaje.isChecked = false;
  });

}

async  borrarMensajesSeleccionados() {

  if (this.mensajes.length > 0) {

    const hayChequeado = this.mensajes.find(mensaje => mensaje.isChecked === true);

    if (hayChequeado) {
    let cant = 0;

    console.log('pre ciclo', cant );

    this.mensajes.forEach(mensaje => {
      if (mensaje.isChecked) {
        console.log('mensaje a borrar', mensaje);
        cant ++ ;
        console.log('resultado borrado', this.pushService.borrarMensaje(mensaje.notificationID));
      }

    });

    console.log('post ciclo', cant );
    // Recargo mensajes a la pantalla
    this.mensajes = await this.pushService.getMensajes();

  }
  }

}


async  borrarMensajesTodos() {
  await this.pushService.borrarMensajes();
  this.mensajes = [];
  console.log(this.mensajes);
}

compartir() {
  this.socialSharing.share(
    this.pushService.userId,
    'IdPush',
    '',
    ''
    );
}

onClick(push) {
  console.log('esta chequeado ', push.isChecked);
}

async presentAlertConfirm() {
  if (this.mensajes.length > 0) {
  const cant2: number = this.calcular();

  let textoAmostrar = '';
  if (cant2 > 0)  {
      textoAmostrar = '<strong>Desea eliminar los mensajes seleccionados?</strong>!!!';
  } else if (cant2 === undefined) {
      textoAmostrar = '<strong>Desea eliminar TODOS los mensajes?</strong>!!!';
  }

  const alert = await this.alertController.create({
   // cssClass: 'my-custom-class',
    header: 'Atención!',
  // message: '<strong>Desea eliminar los mensajes seleccionados?</strong>!!!',
  message: textoAmostrar,
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
        cssClass: 'secondary',
        handler: (blah) => {
          console.log('Confirmar Cancelar: blah');
        }
      }, {
        text: 'OK',
        handler: () => {
          console.log('Confirmar Okay');
          if (cant2) {
            console.log('la cantidad es ', cant2);
            this.borrarMensajesSeleccionados();
          } else {
          console.log('la cantidad del else es ', cant2);
          this.borrarMensajesTodos();
          console.log('Se borraron todos');
          }
        }
      }
    ]
  });

  await alert.present();
}
}

  calcular() {

    const hayChequeado = this.mensajes.find(mensaje => mensaje.isChecked === true);

    if (hayChequeado) {
    let cant = 0;

    console.log('pre ciclo', cant );

    this.mensajes.forEach(mensaje => {
      if (mensaje.isChecked) {
        cant ++ ;
      }

    });

    console.log('post ciclo', cant );
    return cant;
    // Recargo mensajes a la pantalla
  }
}

}
