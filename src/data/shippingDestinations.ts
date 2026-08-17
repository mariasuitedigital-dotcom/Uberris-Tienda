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
}

export const RIVERA_CARGO_BRANCHES: RiveraCargoBranch[] = [
  // LIMA CENTRO, NORTE, SUR (Salidas Diarias 5:00 PM)
  {
    id: 'rc_luna_pizarro',
    name: 'LUNA PIZARRO (La Victoria)',
    zone: 'Lima Centro / Norte / Sur',
    address: 'Luna Pizarro 424 (Cruce con 28 de Julio), La Victoria',
    dispatchSchedule: 'Envío: 5:00 PM',
    arrivalNotice: 'Llega 4:00 PM al día siguiente',
  },
  {
    id: 'rc_atocongo',
    name: 'TERMINAL ATOCONGO',
    zone: 'Lima Centro / Norte / Sur',
    address: 'Terminal Atocongo, Panamericana Sur',
    phone: '929 955 365',
    dispatchSchedule: 'Envío: 5:00 PM',
    arrivalNotice: 'Llega 10:00 AM al día siguiente',
  },
  {
    id: 'rc_sjm',
    name: 'SAN JUAN DE MIRAFLORES',
    zone: 'Lima Centro / Norte / Sur',
    address: 'Av. Los Héroes 893 (Recoge en Ofi. Real Chancas)',
    phone: '994 980 630',
    dispatchSchedule: 'Envío: 5:00 PM',
    arrivalNotice: 'Llega 3:30 PM al día siguiente',
  },
  {
    id: 'rc_sjl',
    name: 'SAN JUAN DE LURIGANCHO',
    zone: 'Lima Centro / Norte / Sur',
    address: 'Av. San Martín con República de Polonia 301 (Recoge Of. Real Chancas)',
    phone: '919 030 454',
    dispatchSchedule: 'Envío: 5:00 PM',
    arrivalNotice: 'Llega 4:30 PM al día siguiente',
  },
  {
    id: 'rc_smp',
    name: 'SAN MARTÍN DE PORRES',
    zone: 'Lima Centro / Norte / Sur',
    address: 'Mz F Lote 16 Asoc. Nísperos (Av. Alcides Vigo con Colegio San Nicolás)',
    phone: '961 898 152',
    dispatchSchedule: 'Envío: 5:00 PM',
    arrivalNotice: 'Llega 5:00 PM al día siguiente',
  },
  {
    id: 'rc_los_olivos',
    name: 'LOS OLIVOS',
    zone: 'Lima Centro / Norte / Sur',
    address: 'Av. Alfredo Mendiola 4138 (Ofic. 4 Suyos)',
    phone: '960 331 985',
    dispatchSchedule: 'Envío: 5:00 PM',
    arrivalNotice: 'Llega 5:00 PM al día siguiente',
  },
  {
    id: 'rc_fiori',
    name: 'FIORI (San Martín de Porres)',
    zone: 'Lima Centro / Norte / Sur',
    address: 'Av. Miguel Ángel 124, Fiori (Al costado de Ofi. Palomino)',
    phone: '953 974 810',
    dispatchSchedule: 'Envío: 5:00 PM',
    arrivalNotice: 'Llega 5:00 PM al día siguiente',
  },
  {
    id: 'rc_jose_olaya',
    name: 'JOSÉ OLAYA',
    zone: 'Lima Centro / Norte / Sur',
    address: 'Av. Bolivia Mz. V Lote 19 (Taller Vidriería Menezez, a 1/2 cdra Paradero José Olaya)',
    dispatchSchedule: 'Envío: 5:00 PM',
    arrivalNotice: 'Llega 5:00 PM al día siguiente',
  },

  // CALLAO Y VENTANILLA
  {
    id: 'rc_callao',
    name: 'CALLAO (Aeropuerto)',
    zone: 'Callao y Ventanilla',
    address: 'Av. Nuevo Aeropuerto (Mz "B2" Lote 18 Santa Rosa - Bodega Victoria)',
    phone: '942 433 304',
    dispatchSchedule: 'Envío: 5:00 PM',
    arrivalNotice: 'Llega 5:00 PM al día siguiente',
  },
  {
    id: 'rc_ventanilla',
    name: 'VENTANILLA',
    zone: 'Callao y Ventanilla',
    address: 'Mz I Lote 29 Desarrollo 2000 Parque Las Viñas (Entrada de Chifa Oriental)',
    phone: '918 986 178',
    dispatchSchedule: 'Envío: 5:00 PM',
    arrivalNotice: 'Llega 5:00 PM al día siguiente',
  },
  {
    id: 'rc_mi_peru',
    name: 'MI PERÚ',
    zone: 'Callao y Ventanilla',
    address: 'Mz C Lote 14 3er Sector AA.HH Confraternidad Mi Perú (Entre Av. Arequipa y Av. Huaura)',
    dispatchSchedule: 'Envío: 5:00 PM',
    arrivalNotice: 'Llega 5:00 PM al día siguiente',
  },
  {
    id: 'rc_pachacutec',
    name: 'PACHACÚTEC',
    zone: 'Callao y Ventanilla',
    address: 'Mz M Lote 9C Kawachi (Ref: Espalda Colegio Jorge Portocarrero, frente a Loza Kawachi)',
    dispatchSchedule: 'Envío: 5:00 PM',
    arrivalNotice: 'Llega 5:00 PM al día siguiente',
  },

  // RUTAS ESPECIALES (Salidas: Martes y Viernes 5:00 PM | Llegada: Miércoles y Sábados)
  {
    id: 'rc_puente_piedra',
    name: 'PUENTE PIEDRA (Mar y Vie)',
    zone: 'Rutas Especiales (Mar/Vie)',
    address: 'Av. Panamericana Norte (Counter de Empresa Universo)',
    phone: '922 942 296',
    dispatchSchedule: 'Salidas: Martes y Viernes 5:00 PM',
    arrivalNotice: 'Llega Miércoles y Sábados a las 5:00 PM',
  },
  {
    id: 'rc_santa_anita',
    name: 'SANTA ANITA (Mar y Vie)',
    zone: 'Rutas Especiales (Mar/Vie)',
    address: 'Av. Metropolitana Mz F Lt 24 cruce con Huarochirí (Recoge en Tours VIP Pariakaka)',
    phone: '991 097 930',
    dispatchSchedule: 'Salidas: Martes y Viernes 5:00 PM',
    arrivalNotice: 'Llega Miércoles y Sábados a las 5:00 PM',
  },
  {
    id: 'rc_ate_vitarte',
    name: 'ATE VITARTE (Mar y Vie)',
    zone: 'Rutas Especiales (Mar/Vie)',
    address: 'Terminal Barbadillo, Carretera Central',
    dispatchSchedule: 'Salidas: Martes y Viernes 5:00 PM',
    arrivalNotice: 'Llega Miércoles y Sábados a las 5:00 PM',
  },
  {
    id: 'rc_manchay',
    name: 'MANCHAY (Mar y Vie)',
    zone: 'Rutas Especiales (Mar/Vie)',
    address: 'Víctor Malazques (Ref: Agencia Real Chancas)',
    phone: '950 775 470',
    dispatchSchedule: 'Salidas: Martes y Viernes 5:00 PM',
    arrivalNotice: 'Llega Miércoles y Sábados a las 5:00 PM',
  },
  {
    id: 'rc_huaycan',
    name: 'HUAYCÁN (Mar y Vie)',
    zone: 'Rutas Especiales (Mar/Vie)',
    address: 'Terminal Lavadero, Counter GYH K17 Carretera Central',
    phone: '922 329 172',
    dispatchSchedule: 'Salidas: Martes y Viernes 5:00 PM',
    arrivalNotice: 'Llega Miércoles y Sábados a las 5:00 PM',
  },
  {
    id: 'rc_lurin',
    name: 'LURÍN (Mar y Vie)',
    zone: 'Rutas Especiales (Mar/Vie)',
    address: 'Antigua Panamericana Sur Km 33.5 (Oficina Darla Cargo)',
    dispatchSchedule: 'Salidas: Martes y Viernes 5:00 PM',
    arrivalNotice: 'Llega Miércoles y Sábados a las 9:00 AM',
  },
  {
    id: 'rc_carabayllo',
    name: 'CARABAYLLO (Mar y Vie)',
    zone: 'Rutas Especiales (Mar/Vie)',
    address: 'Jr. Sánchez Cerro 463 Progreso Carabayllo (Subir 4 cuadras)',
    phone: '992 836 331',
    dispatchSchedule: 'Salidas: Martes y Viernes 5:00 PM',
    arrivalNotice: 'Llega Miércoles y Sábados a las 5:00 PM',
  },
];

export const OTHER_SHIPPING_AGENCIES = [
  'Shalom (Agencia)',
  'Marvisur (Agencia)',
  'Olva Courier (A Domicilio / Agencia)',
  'Cruz del Sur Cargo',
  'Otra Agencia / Transporte',
];
