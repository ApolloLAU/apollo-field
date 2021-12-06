import * as Parse from 'parse/react-native';

const parse = require('parse/react-native');
import { AsyncStorage } from 'react-native';

class Patient extends Parse.Object {
  // first name
  // last name
  // home address
  // current loc?
  // cell nb
  // dob
  // blood type
  // height
  // weight
  // allergies
  // previous medical conditions?

  constructor() {
    super('Patient');
  }

  static createEmptyPatient() {
    const p = new Patient();
    p.setFirstName('');
    p.setHeight(-1.0);
    p.setHomeAddress('');
    p.setAllergies('');
    p.setBloodType('');
    p.setPrevConditions(false);
    p.setCellNbr('');
    p.setEmergencyNbr('');
    p.setDOB(new Date(0));
    p.setLastName('');
    p.setWeight(-1.0);
    p.setSex('');
    return p;
  }

  static getAllPatients(): Promise<Array<Patient>> {
    return new Parse.Query(Patient).find();
  }

  getAbnormalities() {
    return this.get('abnormalities') || [];
  }

  setAbnormalities(abns: []) {
    this.set('abnormalities', abns);
  }

  getSex(): string {
    return this.get('sex');
  }

  setSex(sex) {
    this.set('sex', sex)
  }

  getEmergencyNbr(): string {
    return this.get('emergency_nbr');
  }

  setEmergencyNbr(nbr: string) {
    this.set('emergency_nbr', nbr);
  }


  getFirstName(): string {
    return this.get('first_name');
  }

  setFirstName(name: string) {
    this.set('first_name', name);
  }

  getLastName(): string {
    return this.get('last_name');
  }

  setLastName(name: string) {
    this.set('first_name', name);
  }

  getHomeAddress(): string {
    return this.get('address');
  }

  setHomeAddress(addr: string) {
    this.set('address', addr);
  }

  getCellNbr() {
    return this.get('phoneNb');
  }

  setCellNbr(nbr: string) {
    return this.set('phoneNb', nbr);
  }

  getDOB(): Date {
    return this.get('dob');
  }

  setDOB(dob: Date) {
    this.set('dob', dob);
  }

  getBloodType(): string {
    return this.get('blood_type');
  }

  setBloodType(bloodType: string) {
    this.set('blood_type', bloodType);
  }

  getHeight(): number {
    return this.get('height');
  }

  setHeight(height: number) {
    this.set('height', height);
  }

  getWeight(): number {
    return this.get('weight');
  }

  setWeight(weight: number) {
    this.set('weight', weight);
  }

  getAllergies(): string {
    return this.get('allergies');
  }

  setAllergies(allergies: string) {
    this.set('allergies', allergies);
  }

  getPrevConditions(): string {
    return this.get('prev_conditions');
  }

  setPrevConditions(prevConditions: boolean) {
    this.set('prev_conditions', prevConditions);
  }

  getFormattedName() {
    return `${this.getFirstName() || ''} ${this.getLastName() || ''}`;
  }
}

class District extends Parse.Object {
  constructor() {
    super('District');
  }

  setName(name: string) {
    this.set('name', name);
  }

  getName(): string {
    return this.get('name');
  }

  setLoc(loc: Parse.GeoPoint) {
    this.set('location', loc);
  }

  getLoc() {
    return this.get('location');
  }

  static createDistrict(
    name: string,
    loc: { lng: number; lat: number }
  ): Promise<District> {
    const district = new District();
    const pt = new Parse.GeoPoint({ latitude: loc.lat, longitude: loc.lng });
    district.setName(name);
    district.setLoc(pt);
    return district.save();
  }
}

class MedicalDataPt extends Parse.Object {
  constructor() {
    super('MedicalData');
  }

  getDataType(): string {
    return this.get('datatype');
  }

  getDataValue(): string {
    return this.get('value');
  }

  getRelatedMission(): Mission {
    return this.get('mission_record');
  }

  static async getMedicalDataForMission(
    missionId: string
  ): Promise<Array<MedicalDataPt>> {
    return new Parse.Query(MedicalDataPt)
      .equalTo('mission_record', missionId)
      .limit(10000) // do we need more than 10,000 values??Í
      .ascending('createdAt')
      .find();
  }

  // getRelatedPatient(): FRSPatient {

  // }
}

class SensorData extends Parse.Object {
  constructor() {
    super('SensorData');
    this.set('ECG', []);
    this.set('raw_ECG', []);
    this.set('predicted_diseases', []);
    this.set('rpeaks', []);
    this.set('ybeats', []);
    this.set('bpm', []);
  }

  setMission(mission: Mission) {
    this.set('mission', mission)
  }

  setPatient(p: Patient) {
    this.set('patient', p);
  }

  addRawECGValues(values: number[]) {
    this.set('raw_ECG', values);
  }

  getCleanECGVals() {
    return this.get('ECG');
  }

  getCurrentBPM() {
    if (this.get('bpm').length > 0)
      return this.get('bpm').at(-1);
    return 0;
  }

  static getQueryForCurrentMission(mission: Mission, patient: Patient) {
    return new Parse.Query(SensorData)
        .equalTo('mission', mission)
        .equalTo('patient', patient)
        .ascending('createdAt');
  }

}

class ChatMessage extends Parse.Object {
  createdAt: any;

  constructor() {
    super('ChatMessage');
    this.setMessage('');
    this.set('image', undefined);
  }

  static getMessageForMissionQuery(
    missionId: string
  ): Parse.Query<ChatMessage> {
    return new Parse.Query(ChatMessage)
      .equalTo('for_mission', missionId)
      .descending('createdAt');
  }

  static getMessagesForMissionId(
    missionId: string
  ): Promise<Array<ChatMessage>> {
    return this.getMessageForMissionQuery(missionId).find();
  }

  setSender(w: MWorker) {
    this.set('sender', w);
  }

  getSender(): MWorker {
    return this.get('sender');
  }

  isSenderBase(): boolean {
    // todo: maybe make this better?
    return this.getSender().getRole() === 'base_worker';
  }

  setMission(missionId: string) {
    this.set('for_mission', missionId);
  }

  setMessage(msg: string) {
    this.set('message', msg);
  }

  getMessage() {
    return this.get('message');
  }

  getImage() {
    const img = this.get('image');
    if (img !== undefined) return img.url();
    return null;
  }

  setImage(image) {
    this.set("image", image)
  }
}

class Mission extends Parse.Object {
  constructor() {
    super('Mission');
  }

  static createDeployableMission(): Mission {
    const m = new Mission();
    m.set('base_workers', []);
    m.set('field_workers', []);
    m.set('patients', []);
    m.setStatus('deployable');
    m.setInitialDesc('');
    m.setFinalDesc('');
    return m;
  }

  static getDeployableMissions(): Promise<Array<Mission>> {
    return Parse.Cloud.run('getActiveMissions');
  }

  static getCompletedMissions(): Promise<Array<Mission>> {
    return new Parse.Query(Mission)
      .equalTo('status', 'complete')
      .includeAll()
      .find();
  }

  static getByID(id: string): Promise<Mission | undefined> {
    return new Parse.Query(Mission)
      .equalTo('objectId', id)
      .includeAll()
      .first();
  }

  static getWorkerActiveMissionQuery(currentWorker: MWorker): Parse.Query {
    return new Parse.Query(Mission)
        .equalTo('status', 'active')
        .equalTo('field_workers', currentWorker)
  }

  static getWorkerActiveMission(
      currentWorker: MWorker
  ): Promise<Mission | null> {
    return this.getWorkerActiveMissionQuery(currentWorker)
      .find()
      .then((missions: Array<Mission>) => {
        // console.log('active missions:', missions);
        if (missions.length !== 0) {
          return missions[0];
        }
        return null;
      });
  }

  getBaseWorkers(): Array<MWorker> {
    return this.get('base_workers');
  }

  getFieldWorkers(): Array<MWorker> {
    return this.get('field_workers');
  }

  getPatients(): Array<Patient> {
    return this.get('patients');
  }

  addBaseWorker(worker: MWorker) {
    this.add('base_workers', worker);
  }

  addFieldWorker(worker: MWorker) {
    this.add('field_workers', worker);
  }

  addPatient(patient: string | Patient) {
    this.add('patients', patient);
  }

  getLocation() {
    this.get('location');
  }

  setLocation(loc: Parse.GeoPoint) {
    this.set('location', loc);
  }

  setInitialDesc(desc: string) {
    this.set('initial_description', desc);
  }

  getInitialDesc(): string {
    return this.get('initial_description');
  }

  setFinalDesc(desc: string) {
    this.set('final_description', desc);
  }

  getFinallDesc(): string {
    return this.get('final_description');
  }

  setFormattedLocation(l: string) {
    this.set('formatted_loc', l);
  }

  getFormattedLocation() {
    return this.get('formatted_loc');
  }

  setStatus(status: string) {
    this.set('status', status);
  }

  getStatus(): string {
    return this.get('status');
  }

  formatPatientNames() {
    const patients = this.getPatients();
    // console.log('patients:', patients);
    if (patients.length === 1) {
      return patients[0].getFormattedName();
    }
    if (patients.length > 1) {
      return 'Multiple Patients';
    }
    return 'No patients';
  }

  static getMissionQueryForId(missionId: string) {
    return new Parse.Query(Mission).equalTo('objectId', missionId);
  }

  getQueryForPatients() {
    const patients = this.getPatients();
    const pIds = patients.map((p) => p.id);
    return new Parse.Query(Patient).containedIn('objectId', pIds);
  }
}

class MWorker extends Parse.Object {
  constructor() {
    super('Worker');
  }

  static getWorkerQueryForRole(
    role: string,
    district: District
  ): Parse.Query<MWorker> {
    return new Parse.Query(MWorker)
      .equalTo('role', role)
      .equalTo('district', district);
  }

  private static getWorkersWithRole(
    role: string,
    district: District
  ): Promise<Array<MWorker>> {
    return this.getWorkerQueryForRole(role, district).find();
  }

  static getDistrictChiefs(district: District): Promise<Array<MWorker>> {
    return this.getWorkersWithRole('district_chief', district);
  }

  static getFieldWorkers(district: District): Promise<Array<MWorker>> {
    return this.getWorkersWithRole('field_worker', district);
  }

  static getFieldWorkerQuery(district: District): Parse.Query<MWorker> {
    return this.getWorkerQueryForRole('field_worker', district);
  }

  static getBaseWorkers(district: District): Promise<Array<MWorker>> {
    return this.getWorkersWithRole('base_worker', district);
  }

  static getById(id: string): Promise<MWorker | undefined> {
    return new Parse.Query(MWorker).equalTo('objectId', id).first();
  }

  getFormattedName(): string {
    return `${this.getFirstName()} ${this.getLastName()}`;
  }

  getFirstName() {
    return this.get('firstname');
  }

  setFirstName(fName: string) {
    this.set('firstname', fName);
  }

  getLastName() {
    return this.get('lastname');
  }

  setLastName(lName: string) {
    this.set('lastname', lName);
  }

  getImgURL() {
    if (this.get('image_file')) return this.get('image_file').url();
    return '';
  }

  setImg(base64Img: string, imgName: string) {
    const f = new Parse.File(imgName, { base64: base64Img });
    return f.save().then(() => this.set('image_file', f));
  }

  getCellNbr() {
    return this.get('phoneNb');
  }

  setCellNbr(nbr: string) {
    return this.set('phoneNb', nbr);
  }

  getUserID() {
    return this.get('user_id');
  }

  setUserID(id: string) {
    return this.set('user_id', id);
  }

  getUsername(): Promise<string | undefined> {
    return new Parse.Query(Parse.User)
      .equalTo('objectId', this.getUserID())
      .first()
      .then((user: Parse.User | undefined) => {
        if (user) return user.getUsername();
        return '';
      });
  }

  getDistrict(): District {
    return this.get('district');
  }

  setDistrict(district: District) {
    this.set('district', district);
  }

  getRole(): string {
    return this.get('role');
  }

  setRole(role: string) {
    this.set('role', role);
  }

  getStatus(): string {
    return this.get('status');
  }

  setStatus(status: string) {
    this.set('status', status);
  }
}

class API {
  static initAPI() {
    console.log("Initializing Parse");
    Parse.setAsyncStorage(AsyncStorage)
    Parse.initialize('frsAppID');
    parse.serverURL = 'https://apollo-frs-backend.herokuapp.com/parse';

    Parse.Object.registerSubclass('Worker', MWorker);
    Parse.Object.registerSubclass('Mission', Mission);
    Parse.Object.registerSubclass('ChatMessage', ChatMessage);
    Parse.Object.registerSubclass('MedicalData', MedicalDataPt);
    Parse.Object.registerSubclass('District', District);
    Parse.Object.registerSubclass('Patient', Patient);
    Parse.Object.registerSubclass('SensorData', SensorData)
    console.log('API Initialized');
  }

  static getWorkerForUser(user: Parse.User): Promise<MWorker | undefined> {
    return new Parse.Query(MWorker).equalTo('user_id', user.id).first();
  }

  static async login(username: string, pass: string) {
    return Parse.User.logIn(username, pass);
  }

  static async getLoggedInUser(): Promise<Parse.User | undefined> {
    return Parse.User.currentAsync();
  }

  static async logOut() {
    const currentUser = await API.getLoggedInUser();
    if (!currentUser) return Promise.resolve();
    return API.getWorkerForUser(currentUser)
        .then((worker) => {
          if (worker) {
            worker.setStatus('offline');
            return worker.save();
          }
          throw new Error('Worker was undefined');
        })
        .then(() => Parse.User.logOut());
  }
}

export { API, MWorker, Mission, ChatMessage, MedicalDataPt, District, Patient, SensorData };
