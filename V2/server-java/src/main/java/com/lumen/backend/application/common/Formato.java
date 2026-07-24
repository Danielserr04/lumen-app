package com.lumen.backend.application.common;

import java.util.Locale;

/** Locale explícito para formatear importes/porcentajes — nunca depender del locale por
 * defecto de la JVM (en Render puede no ser es-ES, aunque en esta máquina sí lo sea). */
public final class Formato {
    private Formato() {}
    public static final Locale ES = Locale.forLanguageTag("es-ES");
}
