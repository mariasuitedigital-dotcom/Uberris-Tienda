import { ShippingAgency, ShippingDestination } from '../types';

export interface PalominoBranch {
  id: string;
  name: string;
  region: 'Lima' | 'Ica y Nazca' | 'Provincias y Sur';
  address: string;
  hours: string;
  dispatchTime: string;
  arrivalNotice: string;
}

export const PALOMINO_BRANCHES: PalominoBranch[] = [
  // LIMA
  {
    id: 'fiori',
    name: 'FIORI (San Martín de Porres)',
    region: 'Lima',
    address: 'Av. Miguel Ángel 126, San Martín de Porres 15102, Lima',
    hours: 'Lun - Dom: 9:00 AM - 6:00 PM',
    dispatchTime: '4:00 PM',
    arrivalNotice: 'Llega 4:00 PM al día siguiente',
  },
  {
    id: 'atocongo',
    name: 'ATOCONGO (Terminal Sur)',
    region: 'Lima',
    address: 'Terminal Atocongo, Panamericana Sur, Lima',
    hours: 'Lun - Dom: 9:00 AM - 6:00 PM',
    dispatchTime: '4:00 PM',
    arrivalNotice: 'Llega 10:00 PM del día siguiente',
  },
  {
    id: 'sjm',
    name: 'SAN JUAN DE MIRAFLORES',
    region: 'Lima',
    address: 'Av. Los Héroes 793, Lima 15801',
    hours: 'Lun - Sáb: 9:00 AM - 6:00 PM | Dom: 9:00 AM - 3:00 PM',
    dispatchTime: '4:00 PM',
    arrivalNotice: 'Llega 2:00 PM al día siguiente',
  },
  {
    id: 'arriola',
    name: 'ARRIOLA (La Victoria)',
    region: 'Lima',
    address: 'Av. Nicolás Arriola 906 / 910, La Victoria, Lima',
    hours: 'Lun - Dom: 9:00 AM - 6:00 PM',
    dispatchTime: '4:00 PM',
    arrivalNotice: 'Llega 3:00 PM al día siguiente',
  },
  {
    id: 'luna_pizarro',
    name: 'LUNA PIZARRO (La Victoria)',
    region: 'Lima',
    address: 'Jr. Luna Pizarro 343, La Victoria 15033, Lima',
    hours: 'Lun - Dom: 9:00 AM - 6:00 PM',
    dispatchTime: '4:00 PM',
    arrivalNotice: 'Llega 3:00 PM al día siguiente',
  },

  // ICA Y NAZCA
  {
    id: 'ica',
    name: 'ICA (Óvalo)',
    region: 'Ica y Nazca',
    address: 'Ica Óvalo, Agencia Palomino',
    hours: 'Lun - Dom: 8:00 AM - 8:00 PM',
    dispatchTime: '4:00 PM',
    arrivalNotice: 'Llega 10:00 AM al día siguiente',
  },
  {
    id: 'nazca',
    name: 'NAZCA (Terminal)',
    region: 'Ica y Nazca',
    address: 'Nazca Terminal Terrestre',
    hours: 'Lun - Sáb: 8:00 AM - 7:00 PM | Dom: 8:00 AM - 8:00 PM',
    dispatchTime: '4:00 PM',
    arrivalNotice: 'Llega 9:00 AM al día siguiente',
  },

  // PROVINCIAS Y SUR
  {
    id: 'cusco',
    name: 'CUSCO',
    region: 'Provincias y Sur',
    address: 'Industrial 121, Cusco 08007',
    hours: 'Lun - Dom: 8:00 AM - 6:00 PM',
    dispatchTime: '4:00 PM',
    arrivalNotice: 'Llega el Día 2 (recojo a partir de las 4:00 PM)',
  },
  {
    id: 'arequipa',
    name: 'AREQUIPA',
    region: 'Provincias y Sur',
    address: 'Juan Barcleay, Arequipa 04001',
    hours: 'Lun - Dom: 8:00 AM - 6:00 PM',
    dispatchTime: '4:00 PM',
    arrivalNotice: 'Llega el Día 2 (recojo a partir de las 4:00 PM)',
  },
  {
    id: 'puerto_maldonado',
    name: 'PUERTO MALDONADO',
    region: 'Provincias y Sur',
    address: 'Av. Circunvalación Norte 2621 (Terminal Terrestre)',
    hours: 'Lun - Sáb: 8:00 AM - 8:00 PM | Dom: 8:00 AM - 6:00 PM',
    dispatchTime: '4:00 PM',
    arrivalNotice: 'Llega el Día 2 (recojo a partir de las 4:00 PM)',
  },
  {
    id: 'chalhuahuacho',
    name: 'CHALHUAHUACHO',
    region: 'Provincias y Sur',
    address: 'Av. Antabamba s/n (Frente a los bomberos)',
    hours: 'Lun - Dom: 8:00 AM - 7:00 PM',
    dispatchTime: '4:00 PM',
    arrivalNotice: 'Llega el Día 2 (recojo a partir de las 4:00 PM)',
  },
  {
    id: 'huancavelica',
    name: 'HUANCAVELICA',
    region: 'Provincias y Sur',
    address: 'Av. Celestino Manchego Muñoz 793',
    hours: 'Lun - Dom: 8:00 AM - 6:00 PM',
    dispatchTime: '4:00 PM',
    arrivalNotice: 'Llega el Día 2 (recojo a partir de las 4:00 PM)',
  },
  {
    id: 'puquio',
    name: 'PUQUIO',
    region: 'Provincias y Sur',
    address: 'Av. Mariscal Castilla 450',
    hours: 'Lun - Dom: 8:00 AM - 6:00 PM',
    dispatchTime: '4:00 PM',
    arrivalNotice: 'Llega el Día 2 (recojo a partir de las 4:00 PM)',
  },
];

export interface RiveraCargoBranch {
  id: string;
  name: string;
  zone: 'Lima Centro / Norte / Sur' | 'Rutas Especiales (Mar/Vie)' | 'Callao y Ventanilla';
  address: string;
  phone?: string;
  dispatchSchedule: string;
  arrivalNotice: string;
  googleMapsUrl?: string;
}

export const RIVERA_CARGO_BRANCHES: RiveraCargoBranch[] = [
  // LIMA CENTRO, NORTE, SUR (Salidas Diarias 5:00 PM)
  {
    id: 'rc_luna_pizarro',
    name: 'LUNA PIZARRO (La Victoria)',
    zone: 'Lima Centro / Norte / Sur',
    address: 'Luna Pizarro 424 (Cruce con 28 de Julio), La Victoria, Lima',
    dispatchSchedule: 'Envío: 5:00 PM',
    arrivalNotice: 'Llega 4:00 PM al día siguiente',
    googleMapsUrl: 'https://maps.google.com/?q=Luna+Pizarro+424+La+Victoria+Lima',
  },
  {
    id: 'rc_atocongo',
    name: 'TERMINAL ATOCONGO',
    zone: 'Lima Centro / Norte / Sur',
    address: 'Terminal Atocongo, Panamericana Sur, Lima',
    phone: '929 955 365',
    dispatchSchedule: 'Envío: 5:00 PM',
    arrivalNotice: 'Llega 10:00 AM al día siguiente',
    googleMapsUrl: 'https://maps.google.com/?q=Terminal+Atocongo+Lima',
  },
  {
    id: 'rc_sjm',
    name: 'SAN JUAN DE MIRAFLORES',
    zone: 'Lima Centro / Norte / Sur',
    address: 'Av. Los Héroes 893 (Recoge en Ofi. Real Chancas), Lima',
    phone: '994 980 630',
    dispatchSchedule: 'Envío: 5:00 PM',
    arrivalNotice: 'Llega 3:30 PM al día siguiente',
    googleMapsUrl: 'https://maps.google.com/?q=Av+Los+Heroes+893+San+Juan+de+Miraflores+Lima',
  },
  {
    id: 'rc_sjl',
    name: 'SAN JUAN DE LURIGANCHO',
    zone: 'Lima Centro / Norte / Sur',
    address: 'Av. San Martín con República de Polonia 301, San Juan de Lurigancho, Lima',
    phone: '919 030 454',
    dispatchSchedule: 'Envío: 5:00 PM',
    arrivalNotice: 'Llega 4:30 PM al día siguiente',
    googleMapsUrl: 'https://maps.google.com/?q=Av+San+Martin+con+Republica+de+Polonia+301+San+Juan+de+Lurigancho+Lima',
  },
  {
    id: 'rc_smp',
    name: 'SAN MARTÍN DE PORRES',
    zone: 'Lima Centro / Norte / Sur',
    address: 'Mz F Lote 16 Asoc. Nísperos (Av. Alcides Vigo con Colegio San Nicolás), San Martín de Porres, Lima',
    phone: '961 898 152',
    dispatchSchedule: 'Envío: 5:00 PM',
    arrivalNotice: 'Llega 5:00 PM al día siguiente',
    googleMapsUrl: 'https://maps.google.com/?q=Av+Alcides+Vigo+San+Martin+de+Porres+Lima',
  },
  {
    id: 'rc_los_olivos',
    name: 'LOS OLIVOS',
    zone: 'Lima Centro / Norte / Sur',
    address: 'Av. Alfredo Mendiola 4138 (Ofic. 4 Suyos), Los Olivos, Lima',
    phone: '960 331 985',
    dispatchSchedule: 'Envío: 5:00 PM',
    arrivalNotice: 'Llega 5:00 PM al día siguiente',
    googleMapsUrl: 'https://maps.google.com/?q=Av+Alfredo+Mendiola+4138+Los+Olivos+Lima',
  },
  {
    id: 'rc_fiori',
    name: 'FIORI (San Martín de Porres)',
    zone: 'Lima Centro / Norte / Sur',
    address: 'Av. Miguel Ángel 124, Fiori (Al costado de Ofi. Palomino), Lima',
    phone: '953 974 810',
    dispatchSchedule: 'Envío: 5:00 PM',
    arrivalNotice: 'Llega 5:00 PM al día siguiente',
    googleMapsUrl: 'https://maps.google.com/?q=Av+Miguel+Angel+124+San+Martin+de+Porres+Lima',
  },
  {
    id: 'rc_jose_olaya',
    name: 'JOSÉ OLAYA',
    zone: 'Lima Centro / Norte / Sur',
    address: 'Av. Bolivia Mz. V Lote 19 (Taller Vidriería Menezez, a 1/2 cdra Paradero José Olaya), Lima',
    dispatchSchedule: 'Envío: 5:00 PM',
    arrivalNotice: 'Llega 5:00 PM al día siguiente',
    googleMapsUrl: 'https://maps.google.com/?q=Paradero+Jose+Olaya+Lima',
  },

  // CALLAO Y VENTANILLA
  {
    id: 'rc_callao',
    name: 'CALLAO (Aeropuerto)',
    zone: 'Callao y Ventanilla',
    address: 'Av. Nuevo Aeropuerto (Mz "B2" Lote 18 Santa Rosa - Bodega Victoria), Callao',
    phone: '942 433 304',
    dispatchSchedule: 'Envío: 5:00 PM',
    arrivalNotice: 'Llega 5:00 PM al día siguiente',
    googleMapsUrl: 'https://maps.google.com/?q=Av+Nuevo+Aeropuerto+Santa+Rosa+Callao',
  },
  {
    id: 'rc_ventanilla',
    name: 'VENTANILLA',
    zone: 'Callao y Ventanilla',
    address: 'Mz I Lote 29 Desarrollo 2000 Parque Las Viñas (Entrada de Chifa Oriental), Ventanilla',
    phone: '918 986 178',
    dispatchSchedule: 'Envío: 5:00 PM',
    arrivalNotice: 'Llega 5:00 PM al día siguiente',
    googleMapsUrl: 'https://maps.google.com/?q=Parque+Las+Vinas+Ventanilla',
  },
  {
    id: 'rc_mi_peru',
    name: 'MI PERÚ',
    zone: 'Callao y Ventanilla',
    address: 'Mz C Lote 14 3er Sector AA.HH Confraternidad Mi Perú (Entre Av. Arequipa y Av. Huaura), Callao',
    dispatchSchedule: 'Envío: 5:00 PM',
    arrivalNotice: 'Llega 5:00 PM al día siguiente',
    googleMapsUrl: 'https://maps.google.com/?q=AAHH+Confraternidad+Mi+Peru+Callao',
  },
  {
    id: 'rc_pachacutec',
    name: 'PACHACÚTEC',
    zone: 'Callao y Ventanilla',
    address: 'Mz M Lote 9C Kawachi (Espalda Colegio Jorge Portocarrero, frente a Loza Kawachi), Ventanilla',
    dispatchSchedule: 'Envío: 5:00 PM',
    arrivalNotice: 'Llega 5:00 PM al día siguiente',
    googleMapsUrl: 'https://maps.google.com/?q=Kawachi+Pachacutec+Ventanilla',
  },

  // RUTAS ESPECIALES (Salidas: Martes y Viernes 5:00 PM)
  {
    id: 'rc_puente_piedra',
    name: 'PUENTE PIEDRA (Mar y Vie)',
    zone: 'Rutas Especiales (Mar/Vie)',
    address: 'Av. Panamericana Norte (Counter de Empresa Universo), Puente Piedra',
    phone: '922 942 296',
    dispatchSchedule: 'Salidas: Martes y Viernes 5:00 PM',
    arrivalNotice: 'Llega Miércoles y Sábados a las 5:00 PM',
    googleMapsUrl: 'https://maps.google.com/?q=Panamericana+Norte+Puente+Piedra+Lima',
  },
  {
    id: 'rc_santa_anita',
    name: 'SANTA ANITA (Mar y Vie)',
    zone: 'Rutas Especiales (Mar/Vie)',
    address: 'Av. Metropolitana Mz F Lt 24 cruce con Huarochirí (Tours VIP Pariakaka), Santa Anita',
    phone: '991 097 930',
    dispatchSchedule: 'Salidas: Martes y Viernes 5:00 PM',
    arrivalNotice: 'Llega Miércoles y Sábados a las 5:00 PM',
    googleMapsUrl: 'https://maps.google.com/?q=Av+Metropolitana+con+Huarochiri+Santa+Anita+Lima',
  },
  {
    id: 'rc_ate_vitarte',
    name: 'ATE VITARTE (Mar y Vie)',
    zone: 'Rutas Especiales (Mar/Vie)',
    address: 'Terminal Barbadillo, Carretera Central, Ate',
    dispatchSchedule: 'Salidas: Martes y Viernes 5:00 PM',
    arrivalNotice: 'Llega Miércoles y Sábados a las 5:00 PM',
    googleMapsUrl: 'https://maps.google.com/?q=Terminal+Barbadillo+Ate+Lima',
  },
  {
    id: 'rc_manchay',
    name: 'MANCHAY (Mar y Vie)',
    zone: 'Rutas Especiales (Mar/Vie)',
    address: 'Víctor Malazques (Ref: Agencia Real Chancas), Manchay',
    phone: '950 775 470',
    dispatchSchedule: 'Salidas: Martes y Viernes 5:00 PM',
    arrivalNotice: 'Llega Miércoles y Sábados a las 5:00 PM',
    googleMapsUrl: 'https://maps.google.com/?q=Victor+Malasquez+Manchay+Lima',
  },
  {
    id: 'rc_huaycan',
    name: 'HUAYCÁN (Mar y Vie)',
    zone: 'Rutas Especiales (Mar/Vie)',
    address: 'Terminal Lavadero, Counter GYH K17 Carretera Central, Huaycán',
    phone: '922 329 172',
    dispatchSchedule: 'Salidas: Martes y Viernes 5:00 PM',
    arrivalNotice: 'Llega Miércoles y Sábados a las 5:00 PM',
    googleMapsUrl: 'https://maps.google.com/?q=Terminal+Lavadero+Huaycan+Lima',
  },
  {
    id: 'rc_lurin',
    name: 'LURÍN (Mar y Vie)',
    zone: 'Rutas Especiales (Mar/Vie)',
    address: 'Antigua Panamericana Sur Km 33.5 (Oficina Darla Cargo), Lurín',
    dispatchSchedule: 'Salidas: Martes y Viernes 5:00 PM',
    arrivalNotice: 'Llega Miércoles y Sábados a las 9:00 AM',
    googleMapsUrl: 'https://maps.google.com/?q=Antigua+Panamericana+Sur+Km+33.5+Lurin',
  },
  {
    id: 'rc_carabayllo',
    name: 'CARABAYLLO (Mar y Vie)',
    zone: 'Rutas Especiales (Mar/Vie)',
    address: 'Jr. Sánchez Cerro 463 Progreso Carabayllo, Lima',
    phone: '992 836 331',
    dispatchSchedule: 'Salidas: Martes y Viernes 5:00 PM',
    arrivalNotice: 'Llega Miércoles y Sábados a las 5:00 PM',
    googleMapsUrl: 'https://maps.google.com/?q=Jr+Sanchez+Cerro+463+Carabayllo+Lima',
  },
];

export interface NacionalBranch {
  id: string;
  name: string;
  zone: string;
  address: string;
  dispatchSchedule: string;
  arrivalNotice: string;
}

export const AGENCIA_NACIONAL_BRANCHES: NacionalBranch[] = [
  {
    id: 'nac_huanta',
    name: 'Huanta',
    zone: 'Ayacucho / Selva Central',
    address: 'Agencia Nacional - Sede Huanta',
    dispatchSchedule: 'Se envía VIERNES 1:00 PM',
    arrivalNotice: 'Recoge SÁBADO a las 4:00 PM',
  },
  {
    id: 'nac_pichanaki',
    name: 'Pichanaki',
    zone: 'Selva Central',
    address: 'Agencia Nacional - Sede Pichanaki',
    dispatchSchedule: 'Se envía VIERNES 1:00 PM',
    arrivalNotice: 'Recoge SÁBADO a las 4:00 PM',
  },
  {
    id: 'nac_chanchamayo',
    name: 'Chanchamayo (La Merced)',
    zone: 'Selva Central',
    address: 'Agencia Nacional - Sede Chanchamayo',
    dispatchSchedule: 'Se envía VIERNES 1:00 PM',
    arrivalNotice: 'Recoge SÁBADO a las 4:00 PM',
  },
  {
    id: 'nac_satipo',
    name: 'Satipo',
    zone: 'Selva Central',
    address: 'Agencia Nacional - Sede Satipo',
    dispatchSchedule: 'Se envía VIERNES 1:00 PM',
    arrivalNotice: 'Recoge SÁBADO a las 4:00 PM',
  },
  {
    id: 'nac_villa_rica',
    name: 'Villa Rica',
    zone: 'Selva Central',
    address: 'Agencia Nacional - Sede Villa Rica',
    dispatchSchedule: 'Se envía VIERNES 1:00 PM',
    arrivalNotice: 'Recoge SÁBADO a las 4:00 PM',
  },
  {
    id: 'nac_mazamari',
    name: 'Mazamari',
    zone: 'Selva Central',
    address: 'Agencia Nacional - Sede Mazamari',
    dispatchSchedule: 'Se envía VIERNES 1:00 PM',
    arrivalNotice: 'Recoge SÁBADO a las 4:00 PM',
  },
];

export interface MolinaBranch {
  id: string;
  name: string;
  zone: string;
  address: string;
  dispatchSchedule: string;
  arrivalNotice: string;
}

export const AGENCIA_MOLINA_BRANCHES: MolinaBranch[] = [
  {
    id: 'mol_arequipa',
    name: 'Arequipa',
    zone: 'Sur del Perú',
    address: 'Agencia Molina - Sede Arequipa',
    dispatchSchedule: 'Salida 1: Martes 4:00 PM | Salida 2: Viernes 3:00 PM',
    arrivalNotice: 'Salida Martes -> Recoge Jueves 5:00 PM | Salida Viernes -> Recoge Lunes 8:00 AM',
  },
  {
    id: 'mol_juliaca',
    name: 'Juliaca',
    zone: 'Puno / Sur',
    address: 'Agencia Molina - Sede Juliaca',
    dispatchSchedule: 'Salida 1: Martes 4:00 PM | Salida 2: Viernes 3:00 PM',
    arrivalNotice: 'Salida Martes -> Recoge Jueves 5:00 PM | Salida Viernes -> Recoge Lunes 8:00 AM',
  },
  {
    id: 'mol_cusco',
    name: 'Cusco',
    zone: 'Cusco',
    address: 'Agencia Molina - Sede Cusco',
    dispatchSchedule: 'Salida 1: Martes 4:00 PM | Salida 2: Viernes 3:00 PM',
    arrivalNotice: 'Salida Martes -> Recoge Jueves 5:00 PM | Salida Viernes -> Recoge Lunes 8:00 AM',
  },
  {
    id: 'mol_puerto_maldonado',
    name: 'Puerto Maldonado',
    zone: 'Madre de Dios',
    address: 'Agencia Molina - Sede Puerto Maldonado',
    dispatchSchedule: 'Salida 1: Martes 4:00 PM | Salida 2: Viernes 3:00 PM',
    arrivalNotice: 'Salida Martes -> Recoge Jueves 5:00 PM | Salida Viernes -> Recoge Lunes 8:00 AM',
  },
];

export const OTHER_SHIPPING_AGENCIES = [
  'Shalom (Agencia)',
  'Marvisur (Agencia)',
  'Olva Courier (A Domicilio / Agencia)',
  'Cruz del Sur Cargo',
  'Otra Agencia / Transporte',
];

export const INITIAL_SHIPPING_AGENCIES: ShippingAgency[] = [
  {
    id: 'palomino',
    name: 'Expreso Palomino',
    type: 'palomino',
    description: 'Envíos a Lima, Ica, Nazca, Cusco y Provincias del Sur.',
    dispatchDaysSummary: 'Martes y Viernes',
    active: true,
    sortOrder: 1,
  },
  {
    id: 'rivera_cargo',
    name: 'Rivera Cargo',
    type: 'rivera_cargo',
    description: 'Amplia cobertura en todo Lima Metropolitana, Callao, Ventanilla y Conos.',
    dispatchDaysSummary: 'Martes y Viernes',
    active: true,
    sortOrder: 2,
  },
  {
    id: 'shalom',
    name: 'Shalom Empresarial',
    type: 'shalom',
    description: 'Envíos a nivel nacional (Agencia a Agencia). Requiere DNI y Sede de destino.',
    dispatchDaysSummary: 'Martes y Viernes',
    active: true,
    sortOrder: 3,
  },
  {
    id: 'agencia_nacional',
    name: 'Agencia Nacional',
    type: 'agencia_nacional',
    description: 'Despachos especiales hacia Huanta y Selva Central.',
    dispatchDaysSummary: 'Viernes 1:00 PM (Especial Selva Central)',
    active: true,
    sortOrder: 4,
  },
  {
    id: 'agencia_molina',
    name: 'Agencia Molina',
    type: 'agencia_molina',
    description: 'Despachos hacia Arequipa, Juliaca, Cusco y Puerto Maldonado.',
    dispatchDaysSummary: 'Martes (4:00 PM) y Viernes (3:00 PM)',
    active: true,
    sortOrder: 5,
  },
];

export interface ShalomBranch {
  id: string;
  name: string;
  region: string;
  address: string;
  dispatchSchedule: string;
  arrivalNotice: string;
  googleMapsUrl?: string;
}

export const SHALOM_BRANCHES: ShalomBranch[] = [
  {
    id: 'sh_lima_central',
    name: 'Lima - Sede México (La Victoria)',
    region: 'Lima',
    address: 'Av. México 1120, La Victoria, Lima',
    dispatchSchedule: 'Martes y Viernes 4:00 PM',
    arrivalNotice: 'Retiro en 24-48 hrs con DNI en ventanilla',
  },
  {
    id: 'sh_cusco_wanchaq',
    name: 'Cusco - Sede Wanchaq',
    region: 'Cusco',
    address: 'Av. Diagonal Angamos 1953, Wanchaq, Cusco',
    dispatchSchedule: 'Martes y Viernes 4:00 PM',
    arrivalNotice: 'Retiro en 24 hrs con DNI en ventanilla',
  },
  {
    id: 'sh_arequipa',
    name: 'Arequipa - Sede Parque Industrial',
    region: 'Arequipa',
    address: 'Calle Jacinto Ibañez 315, Parque Industrial, Arequipa',
    dispatchSchedule: 'Martes y Viernes 4:00 PM',
    arrivalNotice: 'Retiro en 24-48 hrs con DNI en ventanilla',
  },
  {
    id: 'sh_huancayo',
    name: 'Huancayo - Sede El Tambo',
    region: 'Huancayo',
    address: 'Av. Huancavelica 1420, El Tambo, Huancayo',
    dispatchSchedule: 'Martes y Viernes 4:00 PM',
    arrivalNotice: 'Retiro en 24-48 hrs con DNI en ventanilla',
  },
  {
    id: 'sh_trujillo',
    name: 'Trujillo - Sede Mansiche',
    region: 'Trujillo',
    address: 'Av. Mansiche 1080, Trujillo',
    dispatchSchedule: 'Martes y Viernes 4:00 PM',
    arrivalNotice: 'Retiro en 48 hrs con DNI en ventanilla',
  },
];

export const getStoredShalomBranches = (): ShalomBranch[] => {
  try {
    const saved = localStorage.getItem('uberris_shalom_branches');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return SHALOM_BRANCHES;
};

export const getStoredAgencies = (): ShippingAgency[] => {
  try {
    const saved = localStorage.getItem('uberris_agencies');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return INITIAL_SHIPPING_AGENCIES;
};

export const getStoredPalominoBranches = (): PalominoBranch[] => {
  try {
    const saved = localStorage.getItem('uberris_palomino_branches');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return PALOMINO_BRANCHES;
};

export const getStoredRiveraBranches = (): RiveraCargoBranch[] => {
  try {
    const saved = localStorage.getItem('uberris_rivera_branches');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return RIVERA_CARGO_BRANCHES;
};

export const getStoredNacionalBranches = (): NacionalBranch[] => {
  try {
    const saved = localStorage.getItem('uberris_nacional_branches');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return AGENCIA_NACIONAL_BRANCHES;
};

export const getStoredMolinaBranches = (): MolinaBranch[] => {
  try {
    const saved = localStorage.getItem('uberris_molina_branches');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return AGENCIA_MOLINA_BRANCHES;
};

