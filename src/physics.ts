/** Simplified actuator-disk hover power. NOT flight certification software. */
export function hoverPower(mass:number,area:number,efficiency:number){const gravity=9.81,density=1.225;const thrust=mass*gravity;const ideal=thrust**1.5/Math.sqrt(2*density*area);return {thrust,idealKW:ideal/1000,electricalKW:ideal/(efficiency*1000),tenMinuteKWh:ideal/(efficiency*6000)};}
export function suctionForce(deltaPressure:number,area:number){return deltaPressure*area;}
