{{- define "common.env" -}}
- name: PULSAR_SERVICE_URL
  value: pulsar://{{ .Release.Name }}-pulsar-broker.pulsar.svc.cluster.local:6650
- name: GRAPHQL_CSRF_PREVENTION
  value: "false"
{{- end -}}