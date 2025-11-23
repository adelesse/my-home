import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Light } from './light.model';

@Injectable({
  providedIn: 'root',
})
export class LightService {
  private ip = '192.168.1.191';
  private key = 'yi2AXMZuZu8WZBw4FQqVICDpZJGfOrRbjif2c52L';
  private apiUrl = 'http://' + this.ip + '/api/' + this.key + '/lights';

  constructor(private http: HttpClient) {}

  getLights(): Observable<Light[]> {
    return this.http.get<Record<string, Light>>(this.apiUrl).pipe(
      map((data) =>
        Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }))
      )
    );
  }

  changeState(id: string, state: boolean) {
    this.http.put(this.apiUrl + '/' + id + '/state', { on: state }).subscribe();
  }

  updateBrightness(id: string, brightness: number) {
    this.http
      .put(this.apiUrl + '/' + id + '/state', { bri: brightness })
      .subscribe();
  }

  updateHSB(id: string, color: any) {
    this.http
      .put(this.apiUrl + '/' + id + '/state', {
        xy: this.getRGBtoXY(color),
      })
      .subscribe();
  }

  getRGBtoXY(color: { r: number; g: number; b: number }): [number, number] {
    // Définition des coins du triangle pour une ampoule Hue :
    // - Rouge: (0.675, 0.322)
    // - Vert: (0.4091, 0.518)
    // - Bleu: (0.167, 0.04)

    const normalizedToOne = [color.r / 255, color.g / 255, color.b / 255];

    const applyGammaCorrection = (value: number): number => {
      return value > 0.04045
        ? Math.pow((value + 0.055) / (1.0 + 0.055), 2.4)
        : value / 12.92;
    };

    const red = applyGammaCorrection(normalizedToOne[0]);
    const green = applyGammaCorrection(normalizedToOne[1]);
    const blue = applyGammaCorrection(normalizedToOne[2]);

    const X = red * 0.649926 + green * 0.103455 + blue * 0.197109;
    const Y = red * 0.234327 + green * 0.743075 + blue * 0.022598;
    const Z = red * 0.0 + green * 0.053077 + blue * 1.035763;

    const sum = X + Y + Z;
    const x = X / sum;
    const y = Y / sum;

    return [x, y];
  }

  public getXYtoRGB(
    x: number,
    y: number,
    brightness: number = 1
  ): { r: number; g: number; b: number } {
    if (y === 0) return { r: 0, g: 0, b: 0 }; // Évite la division par zéro

    // Calcul de Y en utilisant la luminosité fournie
    const Y = brightness;
    const X = (Y / y) * x;
    const Z = (Y / y) * (1 - x - y);

    // Conversion de l'espace XYZ vers l'espace RGB
    let r = X * 1.612 - Y * 0.203 - Z * 0.302;
    let g = -X * 0.509 + Y * 1.412 + Z * 0.066;
    let b = X * 0.026 - Y * 0.072 + Z * 0.962;

    // Appliquer la correction gamma inverse
    const applyInverseGammaCorrection = (value: number): number => {
      return value <= 0.0031308
        ? value * 12.92
        : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
    };

    r = applyInverseGammaCorrection(r);
    g = applyInverseGammaCorrection(g);
    b = applyInverseGammaCorrection(b);

    // Normalisation et conversion en valeurs entre 0 et 255
    const normalize = (value: number): number =>
      Math.max(0, Math.min(255, Math.round(value * 255)));

    return {
      r: normalize(r),
      g: normalize(g),
      b: normalize(b),
    };
  }
}
