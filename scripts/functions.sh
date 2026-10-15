#!/usr/bin/env bash

##
## Comprueba si existe una variable=valor en un archivo o la añade.
## Compatible con variables con comillas, espacios y URLs.
##
replace_or_add_var_in_file() {
    local FILE="${1}"
    local VAR="${2}"
    local VALUE_RAW="${3}"

    if [[ -z "${VALUE_RAW:-}" ]]; then
        return 0
    fi

    # Eliminar comillas envolventes si vinieran en el valor
    local CLEAN_VAL=$(echo "${VALUE_RAW}" | sed -e 's/^"//' -e 's/"$//')
    
    # Escapar barras y ampersands para sed
    local ESCAPED_VAL=$(echo "${CLEAN_VAL}" | sed -e 's/[\/&]/\\&/g')
    local LINE="${VAR}=\"${ESCAPED_VAL}\""

    if grep -q "^[[:space:]]*${VAR}=" "${FILE}"; then
        sed -i -e "s|^[[:space:]]*${VAR}=.*|${LINE}|" "${FILE}"
    else
        echo "${LINE}" >> "${FILE}"
    fi
}
